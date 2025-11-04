import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// POST /api/ai/application-checklist - Generate checklist for an application
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
    const { applicationId, grantInfo, attachmentsMarkdown } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId is required" },
        { status: 400 }
      );
    }

    // Verify user owns the application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Build prompt for OpenAI
    const systemPrompt = `You are a grant application assistant. Your task is to analyze grant information and generate a practical checklist of 5-10 action items that an applicant should complete to prepare a strong application.

Focus on:
- Required documents and materials
- Key sections that need to be prepared
- Important deadlines or milestones
- Specific eligibility requirements to verify
- Budget or financial documentation needs

Return ONLY a JSON array of checklist items in this exact format:
[{"text": "Review and confirm eligibility requirements"}, {"text": "Prepare detailed project budget"}]

Do not include any other text or explanations.`;

    let userPrompt = `Grant Information:
Title: ${grantInfo.title || "N/A"}
Description: ${grantInfo.description || grantInfo.description_summary || "N/A"}
Eligibility: ${grantInfo.eligibility || grantInfo.eligibility_summary || "N/A"}
Award Range: ${grantInfo.award_min && grantInfo.award_max ? `$${grantInfo.award_min} - $${grantInfo.award_max}` : "N/A"}
Total Funding: ${grantInfo.total_funding_amount ? `$${grantInfo.total_funding_amount}` : "N/A"}
Deadline: ${grantInfo.close_date || "N/A"}
Agency: ${grantInfo.agency || "N/A"}`;

    if (attachmentsMarkdown && attachmentsMarkdown.trim()) {
      userPrompt += `\n\nAttachment Content:\n${attachmentsMarkdown.substring(0, 8000)}`; // Limit to 8000 chars
    }

    console.log("🤖 Generating checklist with OpenAI...");
    console.log("📝 AI Input - System Prompt:", systemPrompt);
    console.log("📝 AI Input - User Prompt:", userPrompt);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";
    console.log("📤 AI Output - Raw Response:", responseText);

    // Parse the JSON response
    let checklistItems: { text: string }[];
    try {
      checklistItems = JSON.parse(responseText);
      console.log("✅ Successfully parsed AI response:", checklistItems);
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", responseText);
      console.error("Parse error:", parseError);
      // Fallback to default checklist
      checklistItems = [
        { text: "Review grant eligibility requirements" },
        { text: "Prepare project narrative and goals" },
        { text: "Create detailed budget with justifications" },
        { text: "Gather required supporting documents" },
        { text: "Review and complete application forms" },
      ];
      console.log("🔄 Using fallback checklist");
    }

    // Convert to TodoItem format
    const checklist: TodoItem[] = checklistItems.map((item, index) => ({
      id: `todo_${Date.now()}_${index}`,
      text: item.text,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    console.log(`✅ Generated ${checklist.length} checklist items:`, checklist);

    // Save checklist to database
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        checklist: JSON.parse(
          JSON.stringify(checklist)
        ) as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      checklist,
    });
  } catch (error) {
    console.error("Error generating checklist:", error);
    return NextResponse.json(
      { error: "Failed to generate checklist" },
      { status: 500 }
    );
  }
}
