import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Your n8n webhook URL - replace with your actual webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_SEARCH_URL!;

export async function POST(req: NextRequest) {
  const { messages, chatId, organizationId } = await req.json();

  // Construct base URL from request
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user's organization
  const userOrganizationId =
    organizationId || (await getUserOrganizationId(user.id));

  // Fetch organization data
  const organization = await prisma.organization.findUnique({
    where: { id: userOrganizationId },
  });

  if (!organization) {
    return new Response("Organization not found", { status: 404 });
  }

  // Get the last user message
  const lastUserMessage = [...messages]
    .filter((m: { role: string }) => m.role === "user")
    .pop();
  if (!lastUserMessage) return new Response("No user message", { status: 400 });

  // Check if N8N webhook URL is configured
  if (!N8N_WEBHOOK_URL) {
    return new Response("N8N webhook URL not configured", { status: 500 });
  }

  try {
    // 1. Create or get existing chat
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
          id: chatId || undefined, // Let Prisma generate if not provided
          title: generateChatTitle(lastUserMessage.content),
          context: "GENERAL",
          userId: user.id,
          organizationId: userOrganizationId,
        },
        include: { messages: true },
      });
    }

    // 2. Save user message
    const userMessage = await prisma.aiChatMessage.create({
      data: {
        role: "USER",
        content: lastUserMessage.content,
        chatId: chat.id,
        metadata: {
          timestamp: Date.now(),
          source: "webapp",
        },
      },
    });

    // 3. Send to N8N with district information
    // Construct full base URL including organization slug if available
    const fullBaseUrl = organization.slug
      ? `${baseUrl}/private/${organization.slug}`
      : baseUrl;

    const n8nMessage = {
      app_source: "grantfinder-ai-webapp",
      user_id: user.id,
      chat_id: chat.id,
      conversation_id: chat.id,
      message: lastUserMessage.content,
      timestamp: Date.now().toString(),
      message_id: userMessage.id,
      base_url: fullBaseUrl,
      conversation_history: messages,
      // District information for personalized grant recommendations
      district_info: organization.leaId
        ? {
            id: organization.id,
            leaId: organization.leaId,
            name: organization.name,
            state: organization.state,
            stateLeaId: organization.stateLeaId,
            city: organization.city,
            zipCode: organization.zipCode,
            countyName: organization.countyName,
            enrollment: organization.enrollment,
            numberOfSchools: organization.numberOfSchools,
            lowestGrade: organization.lowestGrade,
            highestGrade: organization.highestGrade,
            urbanCentricLocale: organization.urbanCentricLocale,
            districtDataYear: organization.districtDataYear,
            annualOperatingBudget: organization.annualOperatingBudget
              ? organization.annualOperatingBudget.toString()
              : null,
            fiscalYearEnd: organization.fiscalYearEnd || null,
            missionStatement: organization.missionStatement || null,
            strategicPlan: organization.strategicPlan || null,
          }
        : null,
    };

    console.log("🔍 [Grant Finder API] Sending to n8n with district info:", {
      ...n8nMessage,
      district_name: organization.leaId
        ? organization.name
        : "No district linked",
    });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nMessage),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook responded with status: ${response.status}`);
    }

    // Check if response is streaming
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body from n8n");
    }

    // Create a streaming response to the client
    let fullText = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = ""; // Buffer for incomplete JSON chunks
    let clientDisconnected = false;

    // Save response to database after stream completes
    const saveToDatabase = async () => {
      try {
        // After streaming completes, save to database
        console.log("🔍 [Grant Finder API] Full n8n response:", fullText);

        // 4. Save assistant response
        await prisma.aiChatMessage.create({
          data: {
            role: "ASSISTANT",
            content: fullText,
            chatId: chat.id,
            metadata: {
              timestamp: Date.now(),
              model: "n8n-agent",
              source: "n8n",
              clientDisconnected,
            },
          },
        });

        // 5. Update chat's updatedAt
        await prisma.aiChat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });

        console.log(
          `✅ [Grant Finder API] Saved response to DB${clientDisconnected ? " (client disconnected)" : ""}`
        );
      } catch (error) {
        console.error("❌ [Grant Finder API] Error saving to database:", error);
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream content to client while available
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Split by newlines to get individual JSON objects
            const lines = buffer.split("\n");

            // Keep the last incomplete line in the buffer
            buffer = lines.pop() || "";

            // Process each complete line
            for (const line of lines) {
              if (!line.trim()) continue;

              try {
                const jsonChunk = JSON.parse(line);

                // Only process "item" type chunks that have content
                if (jsonChunk.type === "item" && jsonChunk.content) {
                  const content = jsonChunk.content;
                  fullText += content;

                  // Try to send to client, but don't fail if disconnected
                  try {
                    controller.enqueue(encoder.encode(content));
                  } catch {
                    if (!clientDisconnected) {
                      clientDisconnected = true;
                      console.log(
                        "ℹ️ [Grant Finder API] Client disconnected, continuing in background"
                      );
                    }
                  }
                }
                // Log begin/end events for debugging
                else if (jsonChunk.type === "begin") {
                  console.log("🔍 [Grant Finder API] Stream started");
                } else if (jsonChunk.type === "end") {
                  console.log("🔍 [Grant Finder API] Stream ended");
                }
              } catch {
                // Silently skip unparseable chunks
              }
            }
          }

          // Process any remaining buffer content
          if (buffer.trim()) {
            try {
              const jsonChunk = JSON.parse(buffer);
              if (jsonChunk.type === "item" && jsonChunk.content) {
                fullText += jsonChunk.content;
                try {
                  controller.enqueue(encoder.encode(jsonChunk.content));
                } catch {
                  clientDisconnected = true;
                }
              }
            } catch {
              // Silently skip final unparseable chunk
            }
          }

          // Close the stream if still connected
          try {
            controller.close();
          } catch {
            // Controller already closed by client disconnect
            clientDisconnected = true;
          }

          // Save to database (runs in background if client disconnected)
          await saveToDatabase();
        } catch (error) {
          clientDisconnected = true;
          console.log(
            "ℹ️ [Grant Finder API] Stream error (likely client disconnect):",
            error
          );
          // Still save to database even on error
          await saveToDatabase();
        } finally {
          reader.releaseLock();
        }
      },
      cancel() {
        clientDisconnected = true;
        console.log(
          "ℹ️ [Grant Finder API] Client cancelled stream, will save to DB when complete"
        );
      },
    });

    // Return the streaming response to the client
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Id": chat.id,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("❌ [Grant Finder API] Error:", error);
    return new Response("Error processing request", { status: 500 });
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
