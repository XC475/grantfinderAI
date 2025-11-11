import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
}

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

    const { messages, documentId, documentTitle, documentContent, chatId } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    if (!documentId) {
      return new Response("Document ID is required", { status: 400 });
    }

    // Get user's organization
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

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    // Get the document with application relationship
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        applicationId: true,
        application: {
          select: {
            id: true,
            title: true,
            organizationId: true,
            opportunityId: true,
          },
        },
      },
    });

    if (!document) {
      return new Response("Document not found", { status: 404 });
    }

    // Get the document's application and associated opportunity
    let applicationContext = "";
    let opportunityId: number | null = null;

    if (document.application?.opportunityId) {
      opportunityId = document.application.opportunityId;
      // Fetch the opportunity's raw_text from the public schema
      const opportunity = await prisma.opportunities.findUnique({
        where: { id: opportunityId },
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

    // Find or create chat
    let chat;
    if (chatId) {
      chat = await prisma.aiChat.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });
    }

    // Get the last user message
    const lastUserMessage = [...messages]
      .filter((m: { role: string }) => m.role === "user")
      .pop();
    if (!lastUserMessage)
      return new Response("No user message", { status: 400 });

    if (!chat) {
      // Determine organizationId - from application OR from user
      const organizationId =
        document.application?.organizationId || organization.id;

      // Generate chat title from first user message (like normal chats)
      const chatTitle = generateChatTitle(lastUserMessage.content);

      // Create new chat with DRAFTING context
      chat = await prisma.aiChat.create({
        data: {
          title: chatTitle,
          context: "DRAFTING",
          userId: user.id,
          organizationId: organizationId,
          applicationId: document.applicationId, // Optional - null if standalone
          metadata: {
            documentId: documentId,
            documentTitle: document.title || documentTitle || "Untitled",
            chatType: "editor_assistant",
            opportunityId: opportunityId,
          },
        },
      });
    }

    // Save user message with attachments
    await prisma.aiChatMessage.create({
      data: {
        role: "USER",
        content: lastUserMessage.content,
        chatId: chat.id,
        metadata: {
          timestamp: Date.now(),
          source: "editor",
          attachments: lastUserMessage.attachments || [],
        },
      },
    });

    // Build attachment context if files are attached
    let attachmentContext = "";
    if (lastUserMessage.attachments && lastUserMessage.attachments.length > 0) {
      attachmentContext = "\n\nATTACHED FILES:\n";
      lastUserMessage.attachments.forEach((file: FileAttachment) => {
        attachmentContext += `\n--- ${file.name} (${file.type}) ---\n`;
        if (file.extractedText) {
          attachmentContext += file.extractedText + "\n";
        }
      });
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

    // Build system prompt with document context, organization info, application context, and attachments
    const systemPrompt = `You are a helpful assistant for a grant writing application called GrantWare. 
You are helping the user with their document titled "${documentTitle || document.title || "Untitled Document"}".
${organizationContext}
${applicationContext}

CURRENT DOCUMENT CONTENT:
${documentContent || "No content yet."}${attachmentContext}

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
    // Append attachment text to user messages (same as normal chat)
    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(
        (msg: { role: string; content: string; attachments?: FileAttachment[] }) => {
          let content = msg.content;

          // Append extracted text from attachments to user messages
          if (msg.role === "user" && msg.attachments && msg.attachments.length > 0) {
            const attachmentTexts = msg.attachments
              .map((attachment) => {
                if (attachment.extractedText) {
                  return `\n\n[Attached: ${attachment.name}]\nFile contents:\n${attachment.extractedText}`;
                }
                return `\n\n[Attached: ${attachment.name}]`;
              })
              .join("\n");

            content = content + attachmentTexts;
          }

          return {
            role: msg.role as "user" | "assistant",
            content: content,
          } satisfies OpenAI.Chat.ChatCompletionMessageParam;
        }
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
    let fullText = "";
    let clientDisconnected = false;

    // Save response to database after stream completes
    const saveToDatabase = async () => {
      try {
        console.log("📝 [Editor Chat] Saving assistant response to database");

        // Save assistant response
        await prisma.aiChatMessage.create({
          data: {
            role: "ASSISTANT",
            content: fullText,
            chatId: chat.id,
            metadata: {
              timestamp: Date.now(),
              model: "gpt-4o-mini",
              source: "editor",
              clientDisconnected,
            },
          },
        });

        // Update chat's updatedAt
        await prisma.aiChat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });

        console.log(
          `✅ [Editor Chat] Saved response to DB${clientDisconnected ? " (client disconnected)" : ""}`
        );
      } catch (error) {
        console.error("❌ [Editor Chat] Error saving to database:", error);
      }
    };

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullText += content;
              try {
                controller.enqueue(encoder.encode(content));
              } catch {
                if (!clientDisconnected) {
                  clientDisconnected = true;
                  console.log(
                    "ℹ️ [Editor Chat] Client disconnected, continuing in background"
                  );
                }
              }
            }
          }

          // Close the stream if still connected
          try {
            controller.close();
          } catch {
            clientDisconnected = true;
          }

          // Save to database
          await saveToDatabase();
        } catch (error) {
          clientDisconnected = true;
          console.log(
            "ℹ️ [Editor Chat] Stream error (likely client disconnect):",
            error
          );
          // Still save to database even on error
          await saveToDatabase();
          controller.error(error);
        }
      },
      cancel() {
        clientDisconnected = true;
        console.log(
          "ℹ️ [Editor Chat] Client cancelled stream, will save to DB when complete"
        );
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chat.id,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in editor chat API:", error);
    return new Response("Error processing request", { status: 500 });
  }
}

// Helper function to generate chat title from first message
function generateChatTitle(firstMessage: string): string {
  // Simple title generation - take first 50 chars
  return firstMessage.length > 50
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;
}
