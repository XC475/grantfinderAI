import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Helper function to estimate tokens
function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// Helper function to hash raw_text content
function hashRawText(rawText: string | null): string {
  if (!rawText) return "";
  return crypto.createHash("sha256").update(rawText).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    // Check for API key authentication
    const apiKey = req.headers.get("x-api-key");

    // Only allow requests with the correct API key
    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📊 [Vectorize Estimate] Starting text analysis...");

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
      `📊 [Vectorize Estimate] Opportunities: ${totalOpportunities}, Documents: ${totalDocuments}`
    );

    // Get existing documents with their hashes (same logic as /vectorize)
    const existingDocuments = await prisma.$queryRaw<
      Array<{ opportunity_id: number; content_hash: string }>
    >`
      SELECT 
        (metadata->>'opportunity_id')::int as opportunity_id,
        metadata->>'content_hash' as content_hash
      FROM public.documents
      WHERE metadata->>'opportunity_id' IS NOT NULL
    `;

    // Create a map of opportunity_id -> hash
    const existingDocsMap = new Map(
      existingDocuments.map((d) => [d.opportunity_id, d.content_hash])
    );

    console.log(
      `📋 [Vectorize Estimate] Found ${existingDocuments.length} existing documents`
    );

    // Fetch ALL opportunities with raw_text to check for changes
    const allOpportunities = await prisma.opportunities.findMany({
      select: {
        id: true,
        title: true,
        raw_text: true, // Primary content for estimation
      },
    });

    // Determine which opportunities need vectorization (new or changed)
    const opportunitiesToVectorize = [];
    let newCount = 0;
    let changedCount = 0;

    for (const opportunity of allOpportunities) {
      // Skip if no raw_text available
      if (!opportunity.raw_text || !opportunity.raw_text.trim()) {
        continue;
      }

      // Calculate hash from raw_text for change detection
      const currentHash = hashRawText(opportunity.raw_text);
      const existingHash = existingDocsMap.get(opportunity.id);

      if (!existingHash) {
        // New opportunity - needs vectorization
        opportunitiesToVectorize.push(opportunity);
        newCount++;
      } else if (existingHash !== currentHash) {
        // Content changed - needs re-vectorization
        opportunitiesToVectorize.push(opportunity);
        changedCount++;
      }
      // else: Hash matches - already up to date, skip
    }

    console.log(
      `🎯 [Vectorize Estimate] Found ${opportunitiesToVectorize.length} grants to analyze (${newCount} new, ${changedCount} changed)`
    );

    if (opportunitiesToVectorize.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new grants to vectorize",
        stats: {
          opportunities: totalOpportunities,
          documents: totalDocuments,
          toVectorize: 0,
        },
      });
    }

    // Statistics tracking
    const textStats = {
      totalCharacters: 0,
      totalEstimatedTokens: 0,
      minCharacters: Infinity,
      maxCharacters: 0,
      processedCount: 0, // Track actually processed grants
      samples: [] as Array<{
        id: number;
        title: string;
        characters: number;
        tokens: number;
        preview: string;
      }>,
    };

    // Analyze each grant
    opportunitiesToVectorize.forEach((opportunity) => {
      // Use raw_text for estimation
      const contentForEstimation = opportunity.raw_text || "";

      // If no raw_text, log and skip (should not happen due to filtering above, but defensive)
      if (!contentForEstimation.trim()) {
        console.warn(`⚠️ [Estimate] Grant ${opportunity.id} has no raw_text`);
        return; // Skip from forEach
      }

      // Calculate statistics
      const charCount = contentForEstimation.length;
      const estimatedTokenCount = estimateTokens(contentForEstimation);

      textStats.totalCharacters += charCount;
      textStats.totalEstimatedTokens += estimatedTokenCount;
      textStats.minCharacters = Math.min(textStats.minCharacters, charCount);
      textStats.maxCharacters = Math.max(textStats.maxCharacters, charCount);
      textStats.processedCount++; // Increment processed count

      // Store first 10 samples for detailed review
      if (textStats.samples.length < 10) {
        textStats.samples.push({
          id: opportunity.id,
          title: opportunity.title,
          characters: charCount,
          tokens: estimatedTokenCount,
          preview: contentForEstimation.substring(0, 200) + "...",
        });
      }
    });

    // Calculate averages using actually processed count
    const avgCharacters =
      textStats.processedCount > 0
        ? Math.round(textStats.totalCharacters / textStats.processedCount)
        : 0;
    const avgTokens =
      textStats.processedCount > 0
        ? Math.round(textStats.totalEstimatedTokens / textStats.processedCount)
        : 0;

    // Cost calculation for text-embedding-3-small
    const estimatedCostUSD =
      (textStats.totalEstimatedTokens / 1_000_000) * 0.02;

    console.log(`\n📊 [Vectorize Estimate] Text Statistics:`);
    console.log(`   Grants to vectorize: ${opportunitiesToVectorize.length}`);
    console.log(`   Average characters per grant: ${avgCharacters}`);
    console.log(`   Average tokens per grant: ${avgTokens}`);
    console.log(`   Min characters: ${textStats.minCharacters}`);
    console.log(`   Max characters: ${textStats.maxCharacters}`);
    console.log(`   Embedding dimensions: 1536 (fixed)`);
    console.log(`\n💰 [Vectorize Estimate] Cost Estimation:`);
    console.log(
      `   Total tokens: ~${textStats.totalEstimatedTokens.toLocaleString()}`
    );
    console.log(`   Estimated cost: ~$${estimatedCostUSD.toFixed(4)} USD`);
    console.log(`   (Based on text-embedding-3-small: $0.02 per 1M tokens)\n`);

    return NextResponse.json({
      success: true,
      message: `Analysis complete for ${opportunitiesToVectorize.length} grants (${newCount} new, ${changedCount} changed)`,
      dryRun: true,
      stats: {
        opportunities: totalOpportunities,
        documents: totalDocuments,
        toVectorize: opportunitiesToVectorize.length,
        new: newCount,
        changed: changedCount,
        textStatistics: {
          avgCharacters,
          avgTokens,
          minCharacters:
            textStats.minCharacters === Infinity ? 0 : textStats.minCharacters,
          maxCharacters: textStats.maxCharacters,
          totalCharacters: textStats.totalCharacters,
          totalTokens: textStats.totalEstimatedTokens,
          estimatedCostUSD: estimatedCostUSD.toFixed(4),
          embeddingDimensions: 1536,
          processedCount: textStats.processedCount,
          samples: textStats.samples,
        },
      },
    });
  } catch (error) {
    console.error("❌ [Vectorize Estimate] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
