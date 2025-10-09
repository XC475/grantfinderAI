import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Your n8n webhook URL - replace with your actual webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_SEARCH_URL!;

export async function POST(req: NextRequest) {
  const { messages, chatId, workspaceId } = await req.json();

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user's workspace
  const userWorkspaceId = workspaceId || (await getUserWorkspaceId(user.id));

  // Fetch workspace with school district data
  const workspace = await prisma.workspace.findUnique({
    where: { id: userWorkspaceId },
    include: {
      schoolDistrict: true, // Include the full district data
    },
  });

  if (!workspace) {
    return new Response("Workspace not found", { status: 404 });
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
          workspaceId: userWorkspaceId,
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
    const n8nMessage = {
      app_source: "grantfinder-ai-webapp",
      user_id: user.id,
      chat_id: chat.id,
      conversation_id: chat.id,
      message: lastUserMessage.content,
      timestamp: Date.now().toString(),
      message_id: userMessage.id,
      conversation_history: messages,
      // District information for personalized grant recommendations
      district_info: workspace.schoolDistrict
        ? {
            id: workspace.schoolDistrict.id,
            leaId: workspace.schoolDistrict.leaId,
            name: workspace.schoolDistrict.name,
            stateCode: workspace.schoolDistrict.stateCode,
            stateLeaId: workspace.schoolDistrict.stateLeaId,
            city: workspace.schoolDistrict.city,
            zipCode: workspace.schoolDistrict.zipCode,
            countyName: workspace.schoolDistrict.countyName,
            enrollment: workspace.schoolDistrict.enrollment,
            numberOfSchools: workspace.schoolDistrict.numberOfSchools,
            lowestGrade: workspace.schoolDistrict.lowestGrade,
            highestGrade: workspace.schoolDistrict.highestGrade,
            urbanCentricLocale: workspace.schoolDistrict.urbanCentricLocale,
            year: workspace.schoolDistrict.year,
          }
        : null,
      // Workspace context
      workspace_info: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
        district_linked: !!workspace.schoolDistrict,
      },
    };

    console.log("🔍 [Grant Finder API] Sending to n8n with district info:", {
      ...n8nMessage,
      district_name: workspace.schoolDistrict?.name || "No district linked",
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

    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                // Parse the JSON chunk from n8n
                const jsonChunk = JSON.parse(line);

                // Only process "item" type chunks that have content
                if (jsonChunk.type === "item" && jsonChunk.content) {
                  const content = jsonChunk.content;
                  fullText += content;

                  // Send only the content to client (not the JSON wrapper)
                  controller.enqueue(encoder.encode(content));
                }
                // Log begin/end events for debugging
                else if (jsonChunk.type === "begin") {
                  console.log("🔍 [Grant Finder API] Stream started");
                } else if (jsonChunk.type === "end") {
                  console.log("🔍 [Grant Finder API] Stream ended");
                }
              } catch {
                console.warn(
                  "⚠️ [Grant Finder API] Failed to parse JSON chunk:",
                  line
                );
              }
            }
          }

          // Process any remaining buffer content
          if (buffer.trim()) {
            try {
              const jsonChunk = JSON.parse(buffer);
              if (jsonChunk.type === "item" && jsonChunk.content) {
                fullText += jsonChunk.content;
                controller.enqueue(encoder.encode(jsonChunk.content));
              }
            } catch {
              console.warn("⚠️ [Grant Finder API] Failed to parse final chunk");
            }
          }

          // Close the stream
          controller.close();

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
              },
            },
          });

          // 5. Update chat's updatedAt
          await prisma.aiChat.update({
            where: { id: chat.id },
            data: { updatedAt: new Date() },
          });
        } catch (error) {
          console.error("❌ [Grant Finder API] Streaming error:", error);
          controller.error(error);
        }
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
async function getUserWorkspaceId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { personalWorkspaceId: true },
  });

  if (!user?.personalWorkspaceId) {
    throw new Error("User workspace not found");
  }

  return user.personalWorkspaceId;
}

function generateChatTitle(firstMessage: string): string {
  // Simple title generation - take first 50 chars
  return firstMessage.length > 50
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;
}
