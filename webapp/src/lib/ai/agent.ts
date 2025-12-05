import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, DistrictInfo } from "./prompts/chat-assistant";
import { UserAIContextSettings } from "@/types/ai-settings";

export async function createGrantsAgent(
  districtInfo: DistrictInfo | null,
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
  const tools = enableGrantSearch ? [createGrantSearchTool(districtInfo)] : [];

  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(districtInfo, baseUrl, userSettings),
  });

  return agent;
}
