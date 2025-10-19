import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to estimate tokens
function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
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

    // Find opportunities that don't have corresponding documents
    const existingDocumentIds = await prisma.$queryRaw<
      Array<{ opportunity_id: number }>
    >`
      SELECT DISTINCT (metadata->>'opportunity_id')::int as opportunity_id
      FROM public.documents
      WHERE metadata->>'opportunity_id' IS NOT NULL
    `;

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

    console.log(
      `🎯 [Vectorize Estimate] Found ${opportunitiesToVectorize.length} grants to analyze`
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
      // Create text representation (same as what would be embedded)
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
        opportunity.fiscal_year && `Fiscal Year: ${opportunity.fiscal_year}`,
        opportunity.description_summary &&
          `Summary: ${opportunity.description_summary}`,
        opportunity.description && `Description: ${opportunity.description}`,
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

      // Calculate statistics
      const charCount = contentParts.length;
      const estimatedTokenCount = estimateTokens(contentParts);

      textStats.totalCharacters += charCount;
      textStats.totalEstimatedTokens += estimatedTokenCount;
      textStats.minCharacters = Math.min(textStats.minCharacters, charCount);
      textStats.maxCharacters = Math.max(textStats.maxCharacters, charCount);

      // Store first 10 samples for detailed review
      if (textStats.samples.length < 10) {
        textStats.samples.push({
          id: opportunity.id,
          title: opportunity.title,
          characters: charCount,
          tokens: estimatedTokenCount,
          preview: contentParts.substring(0, 200) + "...",
        });
      }
    });

    // Calculate averages
    const avgCharacters = Math.round(
      textStats.totalCharacters / opportunitiesToVectorize.length
    );
    const avgTokens = Math.round(
      textStats.totalEstimatedTokens / opportunitiesToVectorize.length
    );

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
      message: `Analysis complete for ${opportunitiesToVectorize.length} grants`,
      dryRun: true,
      stats: {
        opportunities: totalOpportunities,
        documents: totalDocuments,
        toVectorize: opportunitiesToVectorize.length,
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
