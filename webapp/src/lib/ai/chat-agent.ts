// Chat Agent - LangChain agent for the main chat assistant
// Uses grant search tool and chat-assistant prompt

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, DistrictInfo } from "./prompts/chat-assistant";
import { UserAIContextSettings } from "@/types/ai-settings";

export type { DistrictInfo } from "./prompts/chat-assistant";

export async function createChatAgent(
  districtInfo: DistrictInfo | null,
  baseUrl: string,
  userSettings?: UserAIContextSettings | null
) {
  // Log incoming settings for debugging
  console.log("🤖 [ChatAgent] Creating agent with settings:", {
    enableGrantSearchChat: userSettings?.enableGrantSearchChat ?? "default (true)",
    enableKnowledgeBaseChat: userSettings?.enableKnowledgeBaseChat ?? "default (true)",
    enableOrgProfileChat: userSettings?.enableOrgProfileChat ?? "default (true)",
    settingsId: userSettings?.id || "none",
    userId: userSettings?.userId || "none",
  });

  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.1,
    streaming: true,
  });

  // Create tools - only include grant search if enabled in settings
  const enableGrantSearch = userSettings?.enableGrantSearchChat ?? true;
  const tools = enableGrantSearch ? [createGrantSearchTool(districtInfo)] : [];

  // Log tools being created
  console.log("🔧 [ChatAgent] Tools configuration:", {
    enableGrantSearch,
    toolsCount: tools.length,
    toolNames: tools.map(t => t.name),
  });

  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(districtInfo, baseUrl, userSettings),
  });

  console.log("✅ [ChatAgent] Agent created successfully");

  return agent;
}

