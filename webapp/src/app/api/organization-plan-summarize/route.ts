import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the organization plan text from request body
    const { organizationPlanText } = await req.json();

    if (!organizationPlanText) {
      return NextResponse.json(
        { error: "No organization plan text provided" },
        { status: 400 }
      );
    }

    // Validate text length
    if (organizationPlanText.length < 100) {
      return NextResponse.json(
        { error: "Organization plan text is too short to summarize" },
        { status: 400 }
      );
    }

    // Call OpenAI to summarize and extract grant-relevant information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert grant writer and organizational planning analyst. Your task is to analyze organization plan documents (such as strategic plans, annual reports, or other planning documents) and extract only the most relevant information for funding and grant search purposes.

Focus on extracting and summarizing:
1. Key organizational goals and priorities
2. Specific programs, initiatives, or projects that need funding
3. Target populations or communities served
4. Measurable outcomes and impact areas
5. Budget needs and financial priorities
6. Timeline for implementation
7. Areas of need or challenge that grants could address
8. Innovation or unique approaches being pursued

Output a concise, well-organized summary (500-1000 words) that highlights grant-relevant information. Remove any administrative details, meeting notes, or internal processes that wouldn't be relevant for grant applications.`,
        },
        {
          role: "user",
          content: `Please analyze this organization plan document and extract only the information relevant for grant applications and funding opportunities:\n\n${organizationPlanText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content;

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: summary,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error("Error summarizing organization plan:", error);
    return NextResponse.json(
      {
        error: "Failed to summarize organization plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

