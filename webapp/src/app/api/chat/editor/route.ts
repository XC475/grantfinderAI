import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, documentId, documentTitle, documentContent } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    // Get user's organization and document's application for context
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            zipCode: true,
            countyName: true,
            enrollment: true,
            numberOfSchools: true,
            lowestGrade: true,
            highestGrade: true,
            missionStatement: true,
            strategicPlan: true,
            annualOperatingBudget: true,
            fiscalYearEnd: true,
          },
        },
      },
    });

    const organization = dbUser?.organization;

    // Get the document's application and associated opportunity
    let applicationContext = "";
    if (documentId) {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: {
          applicationId: true,
          application: {
            select: {
              id: true,
              title: true,
              opportunityId: true,
            },
          },
        },
      });

      if (document?.application?.opportunityId) {
        // Fetch the opportunity's raw_text from the public schema
        const opportunity = await prisma.opportunities.findUnique({
          where: { id: document.application.opportunityId },
          select: {
            title: true,
            agency: true,
            raw_text: true,
          },
        });

        if (opportunity?.raw_text) {
          applicationContext = `

APPLICATION CONTEXT:
This document is part of a grant application for: ${opportunity.title}
Agency: ${opportunity.agency || "N/A"}

GRANT OPPORTUNITY DETAILS:
${opportunity.raw_text}`;
        }
      }
    }

    // Build organization context for system prompt
    let organizationContext = "";
    if (organization) {
      organizationContext = `

ORGANIZATION CONTEXT:
You are assisting ${organization.name}${organization.city && organization.state ? ` located in ${organization.city}, ${organization.state}` : ""}.
${organization.enrollment ? `Enrollment: ${organization.enrollment.toLocaleString()} students` : ""}
${organization.numberOfSchools ? `Number of Schools: ${organization.numberOfSchools}` : ""}
${organization.lowestGrade && organization.highestGrade ? `Grade Range: ${organization.lowestGrade} - ${organization.highestGrade}` : ""}
${organization.missionStatement ? `\nMission Statement: ${organization.missionStatement}` : ""}
${organization.strategicPlan ? `\nStrategic Plan: ${organization.strategicPlan}` : ""}
${organization.annualOperatingBudget ? `\nAnnual Operating Budget: $${Number(organization.annualOperatingBudget).toLocaleString()}` : ""}
${organization.fiscalYearEnd ? `Fiscal Year End: ${organization.fiscalYearEnd}` : ""}`;
    }

    // Build system prompt with document context, organization info, and application context
    const systemPrompt = `You are a helpful assistant for a grant writing application called GrantWare. 
You are helping the user with their document titled "${documentTitle || "Untitled Document"}".
${organizationContext}
${applicationContext}

CURRENT DOCUMENT CONTENT:
${documentContent || "No content yet."}

Provide helpful, concise responses about the document content, suggest improvements, 
answer questions, and help with grant writing tasks. Be specific and reference the 
actual content when relevant. Use the organization context to provide tailored suggestions 
that align with the organization's mission, size, and needs. When application context is 
available, ensure your suggestions align with the grant opportunity's requirements and guidelines.

OUTPUT FORMAT:
Use **clean, well-structured markdown** with clear visual hierarchy.
- Use \`#\` for the **main title**
- Use \`##\` or \`###\` for **section headers**
- Use \`**bold**\` for important data, field names, and emphasis.
- Use bullet points (\`-\`) or numbered lists when listing actions, insights, or recommendations.
`;

    // Prepare messages for OpenAI
    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(
        (msg: { role: string; content: string }) =>
          ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }) satisfies OpenAI.Chat.ChatCompletionMessageParam
      ),
    ];

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openAiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error streaming from OpenAI:", error);
          controller.error(error);
        }
      },
    });

    // Generate a chat ID (for future use if we want to persist)
    const chatId = `editor_${documentId}_${Date.now()}`;

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chatId,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in editor chat API:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
