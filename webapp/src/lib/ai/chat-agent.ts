// Chat Agent - LangChain agent for the main chat assistant
// Uses grant search tool and chat-assistant prompt

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, OrganizationInfo } from "./prompts/chat-assistant";
import { UserAIContextSettings } from "@/types/ai-settings";

export type { OrganizationInfo } from "./prompts/chat-assistant";

export async function createChatAgent(
  organizationInfo: OrganizationInfo | null,
  baseUrl: string,
  userSettings?: UserAIContextSettings | null
) {
  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.1,
    streaming: true,
  });

  // Create tools - only include grant search if enabled in settings
  const enableGrantSearch = userSettings?.enableGrantSearchChat ?? true;
  const tools = enableGrantSearch ? [createGrantSearchTool(organizationInfo)] : [];

  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(organizationInfo, baseUrl, userSettings),
  });

  return agent;
}

