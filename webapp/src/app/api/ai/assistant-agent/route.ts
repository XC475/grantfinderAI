// src/app/api/ai/assistant-agent/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { createGrantsAgent } from "@/lib/ai/agent";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { DistrictInfo } from "@/lib/ai/prompts/grants-assistant";
import { getSourceDocumentContext } from "@/lib/documentContext";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedText?: string;
}

interface ChatMessage {
  role: string;
  content: string;
  attachments?: FileAttachment[];
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, organizationId, sourceDocumentIds } =
      await req.json();

    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Get user's organization
    const userOrgId = organizationId || (await getUserOrganizationId(user.id));

    // 3. Fetch organization data
    const organization = await prisma.organization.findUnique({
      where: { id: userOrgId },
    });

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    // 4. Get the last user message
    const lastUserMessage = [...messages]
      .filter((m: { role: string }) => m.role === "user")
      .pop();

    if (!lastUserMessage) {
      return new Response("No user message", { status: 400 });
    }

    // 5. Get or create chat
    let chat;
    if (chatId && chatId !== `chat_${Date.now()}`) {
      // Try to find existing chat
      chat = await prisma.aiChat.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });
    }

    if (!chat) {
      // Create new chat
      chat = await prisma.aiChat.create({
        data: {
          id: chatId || undefined,
          title: generateChatTitle(lastUserMessage.content),
          context: "GENERAL",
          userId: user.id,
          organizationId: userOrgId,
        },
        include: { messages: true },
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

    // 6. Save user message with attachments
    await prisma.aiChatMessage.create({
      data: {
        role: "USER",
        content: lastUserMessage.content,
        chatId: chat.id,
        metadata: {
          timestamp: Date.now(),
          source: "webapp",
          attachments: lastUserMessage.attachments || [],
          ...(sourceDocumentIds &&
            sourceDocumentIds.length > 0 && {
              sourceDocuments: sourceDocumentIds,
            }),
        },
      },
    });

    // 7. Prepare context for agent
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = organization.slug
      ? `${protocol}://${host}/private/${organization.slug}`
      : `${protocol}://${host}`;

    const districtInfo: DistrictInfo | null = organization.leaId
      ? {
          id: organization.id,
          name: organization.name,
          city: organization.city,
          state: organization.state,
          zipCode: organization.zipCode,
          countyName: organization.countyName,
          enrollment: organization.enrollment,
          numberOfSchools: organization.numberOfSchools,
          lowestGrade: organization.lowestGrade,
          highestGrade: organization.highestGrade,
          missionStatement: organization.missionStatement,
          strategicPlan: organization.strategicPlan,
          annualOperatingBudget: organization.annualOperatingBudget
            ? organization.annualOperatingBudget.toString()
            : null,
          fiscalYearEnd: organization.fiscalYearEnd,
        }
      : null;

    // 8. Create agent
    const agent = await createGrantsAgent(districtInfo, baseUrl);

    // 9. Convert all messages to LangChain format (including last user message)
    // If message has attachments, append extracted text to content
    const langChainMessages = messages.map((m: ChatMessage, index: number) => {
      let content = m.content;

      // For the last user message, prepend source document context if available
      const isLastUserMessage =
        index === messages.length - 1 && m.role === "user";
      if (isLastUserMessage && sourceContext) {
        content = `${sourceContext}\n\n${content}`;
      }

      // Append extracted text from attachments to user messages
      if (m.role === "user" && m.attachments && m.attachments.length > 0) {
        const attachmentTexts = m.attachments
          .map((attachment) => {
            if (attachment.extractedText) {
              return `\n\n[Attached: ${attachment.name}]\nFile contents:\n${attachment.extractedText}`;
            }
            return `\n\n[Attached: ${attachment.name}]`;
          })
          .join("\n");

        content = content + attachmentTexts;
      }

      return m.role === "user"
        ? new HumanMessage(content)
        : new AIMessage(content);
    });

    // 10. Execute agent and stream response
    let fullResponse = "";
    const encoder = new TextEncoder();
    let clientDisconnected = false;

    // Save response to database after stream completes
    const saveToDatabase = async () => {
      try {
        await prisma.aiChatMessage.create({
          data: {
            role: "ASSISTANT",
            content: fullResponse,
            chatId: chat.id,
            metadata: {
              timestamp: Date.now(),
              model: "gpt-4o-mini",
              source: "langchain-agent",
              clientDisconnected,
            },
          },
        });

        await prisma.aiChat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error("❌ [Assistant Agent] Error saving to database:", error);
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the agent's response with stream_mode="messages" for token streaming
          const streamResult = await agent.stream(
            {
              messages: langChainMessages,
            },
            {
              streamMode: "messages",
            }
          );

          for await (const chunk of streamResult) {
            // Extract content from LangChain streaming chunks
            // LangChain streams chunks as [message, metadata] tuples in "messages" mode
            let content = "";
            let shouldStream = false;

            // According to LangChain docs, filter based on langgraph_node metadata
            if (Array.isArray(chunk)) {
              // Chunk is [message, metadata] tuple
              const [message, metadata] = chunk;

              // Check metadata to determine if this is from the model or tools
              const node = metadata?.langgraph_node;

              if (
                node === "model" ||
                node === "model_request" ||
                node === "__start__"
              ) {
                // This is from the LLM - stream it to the user
                shouldStream = true;

                // Extract content from the message
                if (typeof message === "string") {
                  content = message;
                } else if (message?.content) {
                  content =
                    typeof message.content === "string"
                      ? message.content
                      : JSON.stringify(message.content);
                }
              } else if (node === "tools") {
                // This is from tool execution - don't stream to user
                // (silently filtered)
              } else {
                // Unknown node - don't stream
                // (silently filtered)
              }
            } else if (chunk && typeof chunk === "object") {
              // Handle non-tuple chunks (fallback for compatibility)
              if (chunk.content) {
                content = chunk.content;
                shouldStream = true;
              } else if (chunk.output) {
                content = chunk.output;
                shouldStream = true;
              }
            } else if (typeof chunk === "string") {
              // Direct string chunk
              content = chunk;
              shouldStream = true;
            }

            // Stream only LLM responses to the client
            if (shouldStream && content) {
              fullResponse += content;

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
          console.error("❌ [Assistant Agent] Stream error:", error);
          // Still save to database even on error
          if (fullResponse) {
            await saveToDatabase();
          }
          controller.error(error);
        }
      },
      cancel() {
        clientDisconnected = true;
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chat.id,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("❌ [Assistant Agent] Error:", error);
    return new Response(
      error instanceof Error ? error.message : "Error processing request",
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserOrganizationId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    throw new Error("User organization not found");
  }

  return user.organizationId;
}

function generateChatTitle(firstMessage: string): string {
  // Simple title generation - take first 50 chars
  return firstMessage.length > 50
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;
}
