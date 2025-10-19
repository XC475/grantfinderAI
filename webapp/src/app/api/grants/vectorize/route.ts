import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import crypto from "crypto";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model to use for embeddings
const EMBEDDING_MODEL = "text-embedding-3-small";

// Type for opportunity content
interface OpportunityContent {
  id?: number;
  title?: string | null;
  description?: string | null;
  description_summary?: string | null;
  agency?: string | null;
  category?: string | null;
  funding_instrument?: string | null;
  state_code?: string | null;
  fiscal_year?: number | null;
  eligibility?: string | null;
  eligibility_summary?: string | null;
  total_funding_amount?: number | null;
  award_min?: number | null;
  award_max?: number | null;
  cost_sharing?: boolean | null;
  post_date?: Date | null;
  close_date?: Date | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  url?: string | null;
  status?: string | null;
}

// Helper function to create a hash of opportunity content
function hashOpportunityContent(opportunity: OpportunityContent): string {
  const contentToHash = JSON.stringify({
    title: opportunity.title,
    description: opportunity.description,
    description_summary: opportunity.description_summary,
    agency: opportunity.agency,
    category: opportunity.category,
    funding_instrument: opportunity.funding_instrument,
    state_code: opportunity.state_code,
    fiscal_year: opportunity.fiscal_year,
    eligibility: opportunity.eligibility,
    eligibility_summary: opportunity.eligibility_summary,
    total_funding_amount: opportunity.total_funding_amount,
    award_min: opportunity.award_min,
    award_max: opportunity.award_max,
    cost_sharing: opportunity.cost_sharing,
    post_date: opportunity.post_date,
    close_date: opportunity.close_date,
    contact_name: opportunity.contact_name,
    contact_email: opportunity.contact_email,
    contact_phone: opportunity.contact_phone,
    url: opportunity.url,
    status: opportunity.status,
  });
  return crypto.createHash("sha256").update(contentToHash).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    // Check for API key authentication
    const apiKey = req.headers.get("x-api-key");

    // Only allow requests with the correct API key, as users should not have access to this endpoint
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 [Vectorize] Starting grant vectorization process...");

    // Get row count for both tables (opportunities, documents)
    const opportunitiesCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.opportunities
    `;

    const documentsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.documents
    `;

    const totalOpportunities = Number(opportunitiesCount[0].count);
    const totalDocuments = Number(documentsCount[0].count);

    console.log(
      `📊 [Vectorize] Opportunities: ${totalOpportunities}, Documents: ${totalDocuments}`
    );

    if (totalDocuments >= totalOpportunities) {
      return NextResponse.json({
        success: true,
        message: "All grants are already vectorized",
        stats: {
          opportunities: totalOpportunities,
          documents: totalDocuments,
          vectorized: 0,
        },
      });
    }

    // Get existing documents with their hashes
    const existingDocuments = await prisma.$queryRaw<
      Array<{ opportunity_id: number; content_hash: string; doc_id: bigint }>
    >`
      SELECT 
        (metadata->>'opportunity_id')::int as opportunity_id,
        metadata->>'content_hash' as content_hash,
        id as doc_id
      FROM public.documents
      WHERE metadata->>'opportunity_id' IS NOT NULL
    `;

    // Create a map of opportunity_id -> {hash, doc_id}
    const existingDocsMap = new Map(
      existingDocuments.map((d) => [
        d.opportunity_id,
        { hash: d.content_hash, docId: d.doc_id },
      ])
    );

    console.log(
      `📋 [Vectorize] Found ${existingDocuments.length} existing documents`
    );

    // Fetch ALL opportunities to check for changes
    const allOpportunities = await prisma.opportunities.findMany({
      select: {
        id: true,
        source: true,
        state_code: true,
        source_grant_id: true,
        status: true,
        title: true,
        description: true,
        description_summary: true,
        agency: true,
        funding_instrument: true,
        category: true,
        fiscal_year: true,
        post_date: true,
        close_date: true,
        archive_date: true,
        cost_sharing: true,
        award_max: true,
        award_min: true,
        total_funding_amount: true,
        eligibility: true,
        eligibility_summary: true,
        contact_name: true,
        contact_email: true,
        contact_phone: true,
        url: true,
      },
    });

    // Determine which opportunities need vectorization
    const opportunitiesToVectorize = [];
    const documentsToDelete = [];
    let changedCount = 0;
    let newCount = 0;

    for (const opportunity of allOpportunities) {
      const currentHash = hashOpportunityContent(opportunity);
      const existingDoc = existingDocsMap.get(opportunity.id);

      if (!existingDoc) {
        // New opportunity - needs vectorization
        opportunitiesToVectorize.push(opportunity);
        newCount++;
      } else if (existingDoc.hash !== currentHash) {
        // Content changed - needs re-vectorization
        opportunitiesToVectorize.push(opportunity);
        documentsToDelete.push(existingDoc.docId);
        changedCount++;
      }
      // else: unchanged, skip
    }

    console.log(
      `🎯 [Vectorize] Found ${opportunitiesToVectorize.length} grants to vectorize (${newCount} new, ${changedCount} changed)`
    );

    // Delete outdated documents for changed opportunities
    if (documentsToDelete.length > 0) {
      console.log(
        `🗑️ [Vectorize] Deleting ${documentsToDelete.length} outdated documents...`
      );
      await prisma.$executeRaw`
        DELETE FROM public.documents 
        WHERE id = ANY(${documentsToDelete}::bigint[])
      `;
      console.log(`✅ [Vectorize] Deleted outdated documents`);
    }

    if (opportunitiesToVectorize.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All grants are up to date",
        stats: {
          opportunities: totalOpportunities,
          documents: totalDocuments,
          vectorized: 0,
          changed: 0,
          new: 0,
        },
      });
    }

    // Process in batches to avoid rate limits
    const BATCH_SIZE = 20;
    let vectorizedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (let i = 0; i < opportunitiesToVectorize.length; i += BATCH_SIZE) {
      const batch = opportunitiesToVectorize.slice(i, i + BATCH_SIZE);
      console.log(
        `⚙️ [Vectorize] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(opportunitiesToVectorize.length / BATCH_SIZE)}`
      );

      const batchPromises = batch.map(async (opportunity) => {
        try {
          // Create text representation of the grant with all fields
          const contentParts = [
            `Opportunity ID: ${opportunity.id}`,
            `Source: ${opportunity.source}`,
            opportunity.source_grant_id &&
              `Source Grant ID: ${opportunity.source_grant_id}`,
            `Status: ${opportunity.status}`,
            `Title: ${opportunity.title}`,
            opportunity.agency && `Agency: ${opportunity.agency}`,
            opportunity.category && `Category: ${opportunity.category}`,
            opportunity.funding_instrument &&
              `Funding Instrument: ${opportunity.funding_instrument}`,
            opportunity.state_code && `State: ${opportunity.state_code}`,
            opportunity.fiscal_year &&
              `Fiscal Year: ${opportunity.fiscal_year}`,
            opportunity.description_summary &&
              `Summary: ${opportunity.description_summary}`,
            opportunity.description &&
              `Description: ${opportunity.description}`,
            opportunity.total_funding_amount &&
              `Total Funding: $${opportunity.total_funding_amount.toLocaleString()}`,
            opportunity.award_min &&
              `Award Minimum: $${opportunity.award_min.toLocaleString()}`,
            opportunity.award_max &&
              `Award Maximum: $${opportunity.award_max.toLocaleString()}`,
            opportunity.cost_sharing !== null &&
              `Cost Sharing Required: ${opportunity.cost_sharing ? "Yes" : "No"}`,
            opportunity.post_date &&
              `Posted: ${opportunity.post_date.toISOString().split("T")[0]}`,
            opportunity.close_date &&
              `Closes: ${opportunity.close_date.toISOString().split("T")[0]}`,
            opportunity.eligibility_summary &&
              `Eligibility Summary: ${opportunity.eligibility_summary}`,
            opportunity.eligibility &&
              `Eligibility Details: ${opportunity.eligibility}`,
            opportunity.contact_name && `Contact: ${opportunity.contact_name}`,
            opportunity.contact_email && `Email: ${opportunity.contact_email}`,
            opportunity.contact_phone && `Phone: ${opportunity.contact_phone}`,
            opportunity.url && `URL: ${opportunity.url}`,
          ]
            .filter(Boolean)
            .join("\n\n");

          // Generate embedding using OpenAI
          const embeddingResponse = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: contentParts,
          });

          const embedding = embeddingResponse.data[0].embedding;

          // Verify embedding dimensions
          if (embedding.length !== 1536) {
            throw new Error(
              `Unexpected embedding size: ${embedding.length} (expected 1536)`
            );
          }

          // Calculate content hash for change detection
          const contentHash = hashOpportunityContent(opportunity);

          // Prepare metadata with opportunity_id, key fields, and content hash
          const metadata = {
            opportunity_id: opportunity.id,
            source: opportunity.source,
            source_grant_id: opportunity.source_grant_id,
            status: opportunity.status,
            title: opportunity.title,
            agency: opportunity.agency,
            category: opportunity.category,
            funding_instrument: opportunity.funding_instrument,
            state_code: opportunity.state_code,
            fiscal_year: opportunity.fiscal_year,
            total_funding_amount: opportunity.total_funding_amount,
            award_min: opportunity.award_min,
            award_max: opportunity.award_max,
            cost_sharing: opportunity.cost_sharing,
            post_date: opportunity.post_date?.toISOString(),
            close_date: opportunity.close_date?.toISOString(),
            url: opportunity.url,
            content_hash: contentHash,
            vectorized_at: new Date().toISOString(),
            model: EMBEDDING_MODEL,
          };

          // Insert into documents table with raw SQL to handle vector type
          await prisma.$executeRaw`
            INSERT INTO public.documents (content, metadata, embedding)
            VALUES (
              ${contentParts},
              ${JSON.stringify(metadata)}::jsonb,
              ${`[${embedding.join(",")}]`}::vector
            )
          `;

          vectorizedCount++;
          console.log(
            `✅ [Vectorize] Vectorized grant ${opportunity.id}: "${opportunity.title}"`
          );
        } catch (error) {
          console.error(
            `❌ [Vectorize] Failed to vectorize grant ${opportunity.id}:`,
            error
          );
          errors.push({
            id: opportunity.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add a small delay between batches to respect rate limits
      if (i + BATCH_SIZE < opportunitiesToVectorize.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `🎉 [Vectorize] Vectorization complete! Vectorized: ${vectorizedCount} (${newCount} new, ${changedCount} changed), Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully vectorized ${vectorizedCount} grants (${newCount} new, ${changedCount} changed)`,
      stats: {
        opportunities: totalOpportunities,
        documents: totalDocuments + vectorizedCount - changedCount,
        vectorized: vectorizedCount,
        new: newCount,
        changed: changedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ [Vectorize] Error in vectorization endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
