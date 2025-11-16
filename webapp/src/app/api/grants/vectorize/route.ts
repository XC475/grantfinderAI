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

// Helper function to create a hash of raw_text content
function hashRawText(rawText: string | null): string {
  if (!rawText) return "";
  return crypto.createHash("sha256").update(rawText).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    // Check for API key authentication
    const apiKey = req.headers.get("x-api-key");

    // Only allow requests with the correct API key, as users should not have access to this endpoint
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get row count for both tables (opportunities, documents)
    const opportunitiesCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.opportunities
    `;

    const documentsCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.documents
    `;

    const totalOpportunities = Number(opportunitiesCount[0].count);
    const totalDocuments = Number(documentsCount[0].count);

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
      ]      )
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
        agency: true,
        funding_instrument: true,
        fiscal_year: true,
        total_funding_amount: true,
        award_min: true,
        award_max: true,
        cost_sharing: true,
        post_date: true,
        close_date: true,
        url: true,
        raw_text: true, // Primary content for vectorization
      },
    });

    // Create a Set of valid opportunity IDs for orphan detection
    const validOpportunityIds = new Set(allOpportunities.map((opp) => opp.id));

    // Find and delete orphaned documents (documents for opportunities that no longer exist)
    const orphanedDocuments = existingDocuments.filter(
      (doc) => !validOpportunityIds.has(doc.opportunity_id)
    );

    if (orphanedDocuments.length > 0) {
      const orphanedDocIds = orphanedDocuments.map((doc) => doc.doc_id);
      await prisma.$executeRaw`
        DELETE FROM public.documents 
        WHERE id = ANY(${orphanedDocIds}::bigint[])
      `;
    }

    // Determine which opportunities need vectorization
    const opportunitiesToVectorize = [];
    const documentsToDelete = [];
    let changedCount = 0;
    let newCount = 0;
    const orphanedCount = orphanedDocuments.length;

    for (const opportunity of allOpportunities) {
      // Skip if no raw_text available
      if (!opportunity.raw_text || !opportunity.raw_text.trim()) {
        console.warn(
          `⚠️ [Vectorize] Skipping grant ${opportunity.id}: no raw_text available`
        );
        continue;
      }

      // Calculate hash from raw_text for change detection
      const currentHash = hashRawText(opportunity.raw_text);
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
      // else: Hash matches and raw_text exists - already up to date
    }

    // Delete outdated documents for changed opportunities
    if (documentsToDelete.length > 0) {
      await prisma.$executeRaw`
        DELETE FROM public.documents 
        WHERE id = ANY(${documentsToDelete}::bigint[])
      `;
    }

    if (opportunitiesToVectorize.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          orphanedCount > 0
            ? `All grants are up to date. Cleaned up ${orphanedCount} orphaned documents.`
            : "All grants are up to date",
        stats: {
          opportunities: totalOpportunities,
          documents: totalDocuments - orphanedCount,
          vectorized: 0,
          changed: 0,
          new: 0,
          orphaned: orphanedCount,
        },
      });
    }

    // Process in batches to avoid rate limits
    const BATCH_SIZE = 20;
    let vectorizedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (let i = 0; i < opportunitiesToVectorize.length; i += BATCH_SIZE) {
      const batch = opportunitiesToVectorize.slice(i, i + BATCH_SIZE);

      // Process each grant in the batch sequentially
      for (const opportunity of batch) {
        try {
          // Use raw_text directly for embedding
          const contentForEmbedding = opportunity.raw_text || "";

          // Skip if no content (should already be filtered, but double-check)
          if (!contentForEmbedding.trim()) {
            console.warn(
              `⚠️ [Vectorize] Grant ${opportunity.id} has no raw_text, skipping...`
            );
            errors.push({
              id: opportunity.id,
              error: "No raw_text available for vectorization",
            });
            continue;
          }

          // Generate embedding using OpenAI
          const embeddingResponse = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: contentForEmbedding,
          });

          const embedding = embeddingResponse.data[0].embedding;

          // Verify embedding dimensions
          if (embedding.length !== 1536) {
            throw new Error(
              `Unexpected embedding size: ${embedding.length} (expected 1536)`
            );
          }

          // Calculate hash of raw_text for change detection
          const contentHash = hashRawText(opportunity.raw_text);

          // Prepare metadata with opportunity_id, key fields, and content hash
          const metadata = {
            opportunity_id: opportunity.id,
            source: opportunity.source,
            source_grant_id: opportunity.source_grant_id,
            status: opportunity.status,
            title: opportunity.title,
            agency: opportunity.agency,
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
            content_hash: contentHash, // Hash of raw_text
            vectorized_at: new Date().toISOString(),
            model: EMBEDDING_MODEL,
            source_field: "raw_text", // Track that we used raw_text
          };

          // Insert into documents table with raw SQL to handle vector type
          await prisma.$executeRaw`
            INSERT INTO public.documents (content, metadata, embedding)
            VALUES (
              ${contentForEmbedding},
              ${JSON.stringify(metadata)}::jsonb,
              ${`[${embedding.join(",")}]`}::vector
            )
          `;

          vectorizedCount++;
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
      }

      // Add a small delay between batches to respect rate limits
      if (i + BATCH_SIZE < opportunitiesToVectorize.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully vectorized ${vectorizedCount} grants (${newCount} new, ${changedCount} changed)${orphanedCount > 0 ? `, cleaned up ${orphanedCount} orphaned documents` : ""}`,
      stats: {
        opportunities: totalOpportunities,
        documents:
          totalDocuments + vectorizedCount - changedCount - orphanedCount,
        vectorized: vectorizedCount,
        new: newCount,
        changed: changedCount,
        orphaned: orphanedCount,
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
