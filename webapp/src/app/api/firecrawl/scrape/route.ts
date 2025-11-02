import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Firecrawl from "@mendable/firecrawl-js";

// POST /api/firecrawl/scrape - Scrape multiple URLs using Firecrawl
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Initialize Firecrawl
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Firecrawl API key not configured" },
        { status: 500 }
      );
    }

    const firecrawl = new Firecrawl({ apiKey });

    // Scrape each URL
    const results = await Promise.all(
      urls.map(async (url: string) => {
        try {
          console.log(`🔍 Scraping URL: ${url}`);
          const result = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });

          // Extract markdown from the result
          const markdown = result.markdown || "";

          console.log(
            `✅ Successfully scraped ${url} (${markdown.length} chars)`
          );

          return {
            url,
            markdown,
            success: true,
          };
        } catch (error) {
          console.error(`❌ Error scraping ${url}:`, error);
          return {
            url,
            markdown: "",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // Calculate success rate
    const successCount = results.filter((r) => r.success).length;
    console.log(`📊 Scraped ${successCount}/${urls.length} URLs successfully`);

    return NextResponse.json({
      results,
      summary: {
        total: urls.length,
        successful: successCount,
        failed: urls.length - successCount,
      },
    });
  } catch (error) {
    console.error("Error in Firecrawl scrape endpoint:", error);
    return NextResponse.json(
      { error: "Failed to scrape URLs" },
      { status: 500 }
    );
  }
}
