import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, DistrictInfo } from "./prompts/chat-assistant";

export async function createGrantsAgent(
  districtInfo: DistrictInfo | null,
  baseUrl: string
) {
  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.1,
    streaming: true,
  });

  // Create tools
  const tools = [createGrantSearchTool(districtInfo)];

  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(districtInfo, baseUrl),
  });

  return agent;
}
