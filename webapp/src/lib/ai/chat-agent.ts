// Chat Agent - LangChain agent for the main chat assistant
// Uses grant search tool and chat-assistant prompt

import { ChatOpenAI } from "@langchain/openai";
// Future: import { ChatAnthropic } from "@langchain/anthropic";
// Future: import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import { buildSystemPrompt, OrganizationInfo } from "./prompts/chat-assistant";
import { UserAIContextSettings } from "@/types/ai-settings";
import { DEFAULT_MODEL, findModelById } from "./models";

export type { OrganizationInfo } from "./prompts/chat-assistant";

export async function createChatAgent(
  organizationInfo: OrganizationInfo | null,
  baseUrl: string,
  userSettings?: UserAIContextSettings | null,
  selectedModel?: string
) {
  // Get the selected model ID (default to user's preference or default model)
  const modelId = selectedModel || userSettings?.selectedModelChat || DEFAULT_MODEL;
  
  // Find the model configuration
  const modelConfig = findModelById(modelId);
  
  if (!modelConfig) {
    throw new Error(`Model not found: ${modelId}`);
  }

  if (!modelConfig.available) {
    throw new Error(`Model is not available: ${modelId}`);
  }

  // Initialize LLM based on provider
  let model;
  
  if (modelConfig.provider === "openai") {
    model = new ChatOpenAI({
      modelName: modelConfig.id,
      temperature: 0.1,
      streaming: modelConfig.supportsStreaming,
    });
  } else if (modelConfig.provider === "anthropic") {
    // Future: Uncomment when Anthropic SDK is installed
    // model = new ChatAnthropic({
    //   modelName: modelConfig.id,
    //   temperature: 0.1,
    //   streaming: modelConfig.supportsStreaming,
    // });
    throw new Error(`Anthropic provider not yet implemented. Model: ${modelId}`);
  } else if (modelConfig.provider === "google") {
    // Future: Uncomment when Google SDK is installed
    // model = new ChatGoogleGenerativeAI({
    //   modelName: modelConfig.id,
    //   temperature: 0.1,
    //   streaming: modelConfig.supportsStreaming,
    // });
    throw new Error(`Google provider not yet implemented. Model: ${modelId}`);
  } else {
    throw new Error(`Unsupported provider: ${modelConfig.provider}`);
  }

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

