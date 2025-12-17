// Editor Agent - LangChain agent for the document editor assistant
// Uses grant search tool and chat-editor prompt

import { ChatOpenAI } from "@langchain/openai";
// Future: import { ChatAnthropic } from "@langchain/anthropic";
// Future: import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import {
  buildEditorSystemPrompt,
  EditorPromptOptions,
  OrganizationInfo,
} from "./prompts/chat-editor";
import { UserAIContextSettings } from "@/types/ai-settings";
import { OrganizationInfo as GrantSearchOrgInfo } from "./prompts/chat-assistant";
import { DEFAULT_MODEL, findModelById } from "./models";

export type { OrganizationInfo, EditorPromptOptions } from "./prompts/chat-editor";

// Convert OrganizationInfo to format for the grant search tool
function toGrantSearchOrgInfo(org: OrganizationInfo | undefined): GrantSearchOrgInfo | null {
  if (!org) return null;
  
  return {
    id: org.id,
    name: org.name,
    city: org.city,
    state: org.state,
    zipCode: org.zipCode,
    countyName: org.countyName,
    missionStatement: org.missionStatement,
    strategicPlan: org.strategicPlan,
    annualOperatingBudget: org.annualOperatingBudget?.toString() ?? null,
    fiscalYearEnd: org.fiscalYearEnd,
    customFields: org.customFields,
  };
}

export async function createEditorAgent(
  promptOptions: EditorPromptOptions,
  userSettings?: UserAIContextSettings | null,
  selectedModel?: string
) {
  // Get the selected model ID (default to user's preference or default model)
  const modelId = selectedModel || userSettings?.selectedModelEditor || DEFAULT_MODEL;
  
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
      temperature: 0.7,
      streaming: modelConfig.supportsStreaming,
    });
  } else if (modelConfig.provider === "anthropic") {
    // Future: Uncomment when Anthropic SDK is installed
    // model = new ChatAnthropic({
    //   modelName: modelConfig.id,
    //   temperature: 0.7,
    //   streaming: modelConfig.supportsStreaming,
    // });
    throw new Error(`Anthropic provider not yet implemented. Model: ${modelId}`);
  } else if (modelConfig.provider === "google") {
    // Future: Uncomment when Google SDK is installed
    // model = new ChatGoogleGenerativeAI({
    //   modelName: modelConfig.id,
    //   temperature: 0.7,
    //   streaming: modelConfig.supportsStreaming,
    // });
    throw new Error(`Google provider not yet implemented. Model: ${modelId}`);
  } else {
    throw new Error(`Unsupported provider: ${modelConfig.provider}`);
  }

  // Create tools - only include grant search if enabled in settings
  const enableGrantSearch = userSettings?.enableGrantSearchEditor ?? true;
  const organizationInfo = toGrantSearchOrgInfo(promptOptions.organizationInfo);
  const tools = enableGrantSearch ? [createGrantSearchTool(organizationInfo)] : [];

  // Build the editor system prompt
  const systemPrompt = buildEditorSystemPrompt(promptOptions);

  // The createAgent function returns a ReactAgent which has invoke() and stream() methods
  const agent = createAgent({
    model,
    tools,
    systemPrompt,
  });

  return agent;
}

