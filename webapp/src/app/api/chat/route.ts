import { NextRequest } from "next/server";

// Your n8n webhook URL - replace with your actual webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_SEARCH_AGENT_TEST_URL!;

export async function POST(req: NextRequest) {
  const { messages, chatId, userId } = await req.json();

  // Get the last user message
  const last = [...messages].filter((m: any) => m.role === "user").pop();
  if (!last) return new Response("No user message", { status: 400 });

  // Check if N8N webhook URL is configured
  if (!N8N_WEBHOOK_URL) {
    return new Response("N8N webhook URL not configured", { status: 500 });
  }

  // Create n8n message format with app identification
  const n8nMessage = {
    app_source: "grantfinder-ai-webapp",
    user_id: userId || "user-123",
    chat_id: chatId || `chat_${Date.now()}`,
    conversation_id: chatId || `conv_${userId || "anonymous"}_${Date.now()}`,
    message: last.content,
    timestamp: Date.now().toString(),
    message_id: `msg_${Date.now()}`,
    // Include full conversation history for context
    conversation_history: messages,
  };

  try {
    console.log("🔍 [Grant Finder API] Sending to n8n:", n8nMessage);

    // Send the message to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nMessage),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook responded with status: ${response.status}`);
    }

    // Accept either JSON or text from n8n
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const text =
      typeof data === "string"
        ? data
        : data.response || data.message || data.content || "OK";

    console.log("🔍 [Grant Finder API] n8n response:", text);

    // Return the response to the client (chat component expects text)
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("❌ [Grant Finder API] Error calling N8N webhook:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
