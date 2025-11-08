import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, DistrictInfo } from "./prompts/grants-assistant";

export async function createGrantsAgent(
  districtInfo: DistrictInfo | null,
  baseUrl: string
) {
  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    streaming: true,
  });

  // Create tools
  const tools = [createGrantSearchTool(districtInfo)];

  // Create agent using the new LangChain 1.0 API
  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt: buildSystemPrompt(districtInfo, baseUrl),
  });

  return agent;
}
