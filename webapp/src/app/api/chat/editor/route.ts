import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

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

    // Build system prompt with document context
    const systemPrompt = `You are a helpful assistant for a grant writing application called GrantWare. 
You are helping the user with their document titled "${documentTitle || "Untitled Document"}".

Current document content:
${documentContent || "No content yet."}

Provide helpful, concise responses about the document content, suggest improvements, 
answer questions, and help with grant writing tasks. Be specific and reference the 
actual content when relevant.`;

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
      model: "gpt-3.5-turbo",
      messages: openAiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
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
