import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model to use for embeddings
const EMBEDDING_MODEL = "text-embedding-3-small";

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

    // Find opportunities that don't have corresponding documents
    // We'll match by opportunity ID stored in document metadata
    const existingDocumentIds = await prisma.$queryRaw<
      Array<{ opportunity_id: number }>
    >`
      SELECT DISTINCT (metadata->>'opportunity_id')::int as opportunity_id
      FROM public.documents
      WHERE metadata->>'opportunity_id' IS NOT NULL
    `;

    // Set of ids of already vectorized opportunities
    const existingIds = new Set(
      existingDocumentIds.map((d) => d.opportunity_id)
    );

    // Fetch opportunities that need vectorization
    const opportunitiesToVectorize = await prisma.opportunities.findMany({
      where: {
        id: {
          notIn: Array.from(existingIds),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        description_summary: true,
        agency: true,
        category: true,
        eligibility: true,
        eligibility_summary: true,
        url: true,
      },
    });

    console.log(
      `🎯 [Vectorize] Found ${opportunitiesToVectorize.length} grants to vectorize`
    );

    if (opportunitiesToVectorize.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new grants to vectorize",
        stats: {
          opportunities: totalOpportunities,
          documents: totalDocuments,
          vectorized: 0,
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
          // Create text representation of the grant
          const contentParts = [
            `Opportunity ID: ${opportunity.id}`,
            `Title: ${opportunity.title}`,
            opportunity.agency && `Agency: ${opportunity.agency}`,
            opportunity.category && `Category: ${opportunity.category}`,
            opportunity.description_summary &&
              `Summary: ${opportunity.description_summary}`,
            opportunity.eligibility_summary &&
              `Eligibility Summary: ${opportunity.eligibility_summary}`,
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

          // Prepare metadata with opportunity_id
          const metadata = {
            opportunity_id: opportunity.id,
            title: opportunity.title,
            agency: opportunity.agency,
            category: opportunity.category,
            url: opportunity.url,
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
      `🎉 [Vectorize] Vectorization complete! Vectorized: ${vectorizedCount}, Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully vectorized ${vectorizedCount} grants`,
      stats: {
        opportunities: totalOpportunities,
        documents: totalDocuments + vectorizedCount,
        vectorized: vectorizedCount,
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
