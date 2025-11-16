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

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total count before filtering
    const totalOpportunitiesCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM public.opportunities
    `;
    const totalOpportunities = Number(totalOpportunitiesCount[0].count);

    // Get all opportunities with raw_text
    const allOpportunities = await prisma.opportunities.findMany({
      where: {
        raw_text: {
          not: null,
        },
      },
      select: {
        id: true,
        source: true,
        state_code: true,
        source_grant_id: true,
        status: true,
        title: true,
        agency: true,
        category: true,
        funding_instrument: true,
        fiscal_year: true,
        total_funding_amount: true,
        award_min: true,
        award_max: true,
        cost_sharing: true,
        post_date: true,
        close_date: true,
        url: true,
        raw_text: true,
      },
    });

    const skippedCount = totalOpportunities - allOpportunities.length;

    if (allOpportunities.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No grants with raw_text found",
        stats: {
          total_opportunities: totalOpportunities,
          opportunities_with_raw_text: 0,
          skipped_no_raw_text: totalOpportunities,
          vectorized: 0,
        },
      });
    }

    // Delete ALL existing documents to start fresh
    await prisma.$executeRaw`
      DELETE FROM public.documents 
      WHERE metadata->>'opportunity_id' IS NOT NULL
    `;

    // Process in batches
    const BATCH_SIZE = 20;
    let vectorizedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (let i = 0; i < allOpportunities.length; i += BATCH_SIZE) {
      const batch = allOpportunities.slice(i, i + BATCH_SIZE);

      // Process each grant in the batch sequentially
      for (const opportunity of batch) {
        try {
          // Use raw_text directly
          const contentForEmbedding = opportunity.raw_text || "";

          // Skip if no content
          if (!contentForEmbedding.trim()) {
            console.warn(
              `⚠️ [Vectorize All] Grant ${opportunity.id} has no raw_text`
            );
            errors.push({ id: opportunity.id, error: "No raw_text available" });
            continue;
          }

          // Generate embedding
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

          // Calculate hash from raw_text
          const contentHash = crypto
            .createHash("sha256")
            .update(contentForEmbedding)
            .digest("hex");

          // Prepare metadata
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
            content_hash: contentHash, // Hash of raw_text
            vectorized_at: new Date().toISOString(),
            model: EMBEDDING_MODEL,
            source_field: "raw_text",
            vectorize_mode: "full_refresh",
          };

          // Insert into documents table
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
            `❌ [Vectorize All] Failed to vectorize grant ${opportunity.id}:`,
            error
          );
          errors.push({
            id: opportunity.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Delay between batches to respect rate limits
      if (i + BATCH_SIZE < allOpportunities.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully vectorized ${vectorizedCount} grants (full refresh)`,
      stats: {
        total_opportunities: totalOpportunities,
        opportunities_with_raw_text: allOpportunities.length,
        skipped_no_raw_text: skippedCount,
        vectorized: vectorizedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("❌ [Vectorize All] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
