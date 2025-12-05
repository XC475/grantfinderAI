// Editor Agent - LangChain agent for the document editor assistant
// Uses grant search tool and chat-editor prompt

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createGrantSearchTool } from "./tools/grant-search-tool";
import {
  buildEditorSystemPrompt,
  EditorPromptOptions,
  OrganizationInfo,
} from "./prompts/chat-editor";
import { UserAIContextSettings } from "@/types/ai-settings";
import { OrganizationInfo as GrantSearchOrgInfo } from "./prompts/chat-assistant";

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
  userSettings?: UserAIContextSettings | null
) {
  // Initialize LLM
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    streaming: true,
  });

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

