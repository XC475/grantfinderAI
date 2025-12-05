import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getSourceDocumentContext } from "@/lib/documentContext";
import { searchKnowledgeBase } from "@/lib/ai/knowledgeBaseRAG";
import { getActiveKnowledgeBase } from "@/lib/getOrgKnowledgeBase";
import { buildEditorSystemPrompt } from "@/lib/ai/prompts/chat-editor";
import { getUserAIContextSettings } from "@/lib/aiContextSettings";

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

    const {
      messages,
      documentId,
      documentTitle,
      documentContent,
      chatId,
      sourceDocumentIds,
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    if (!documentId) {
      return new Response("Document ID is required", { status: 400 });
    }

    // Get user AI context settings
    const userAISettings = await getUserAIContextSettings(user.id);

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
            customFields: {
              select: {
                name: true,
                description: true,
                value: true,
              },
              orderBy: { name: "asc" },
            },
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

    // Get source document context if provided
    let sourceContext = "";
    if (
      sourceDocumentIds &&
      Array.isArray(sourceDocumentIds) &&
      sourceDocumentIds.length > 0
    ) {
      sourceContext = await getSourceDocumentContext(sourceDocumentIds);
    }

    // Get knowledge base context for organization using RAG (semantic search)
    const ragContext = await searchKnowledgeBase(
      lastUserMessage.content,
      organization.id,
      { topK: 5, userId: user.id, context: "editor" }
    );

    // Get general knowledge base context (user-filtered by AI settings)
    const generalKBContext = await getActiveKnowledgeBase(
      organization.id,
      user.id,
      { context: "editor" }
    );

    // Combine all contexts
    let knowledgeBaseContext = "";
    if (ragContext) {
      knowledgeBaseContext += `## Relevant Knowledge Base (Semantic Search)\n\n${ragContext}`;
    }
    if (generalKBContext) {
      knowledgeBaseContext += ragContext
        ? `\n\n## General Knowledge Base Context\n\n${generalKBContext}`
        : `## Knowledge Base Context\n\n${generalKBContext}`;
    }

    // Combine source document context and knowledge base context
    if (knowledgeBaseContext) {
      sourceContext = sourceContext
        ? `${sourceContext}\n\n${knowledgeBaseContext}`
        : knowledgeBaseContext;
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
          ...(sourceDocumentIds &&
            sourceDocumentIds.length > 0 && {
              sourceDocuments: sourceDocumentIds,
            }),
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

    // Build system prompt using the chat-editor prompt builder
    // Pass userSettings so prompt can explicitly state what's enabled/disabled
    const systemPrompt = buildEditorSystemPrompt({
      documentTitle: documentTitle || document.title || "Untitled Document",
      documentContent: documentContent || "No content yet.",
      organizationInfo: userAISettings.enableOrgProfileEditor
        ? {
            ...organization,
            customFields: organization.customFields.map((field) => ({
              name: field.name,
              description: field.description,
              value: field.value,
            })),
          }
        : undefined,
      applicationContext,
      attachmentContext,
      sourceContext,
      knowledgeBaseContext,
      userSettings: userAISettings,
    });

    // Prepare messages for OpenAI
    // Append attachment text to user messages (same as normal chat)
    const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map(
        (msg: {
          role: string;
          content: string;
          attachments?: FileAttachment[];
        }) => {
          let content = msg.content;

          // Append extracted text from attachments to user messages
          if (
            msg.role === "user" &&
            msg.attachments &&
            msg.attachments.length > 0
          ) {
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
          // Still save to database even on error
          await saveToDatabase();
          controller.error(error);
        }
      },
      cancel() {
        clientDisconnected = true;
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
