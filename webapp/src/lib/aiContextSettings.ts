import prisma from "@/lib/prisma";
import { UserAIContextSettings } from "@/types/ai-settings";

/**
 * Get user's AI context settings with defaults if not found
 */
export async function getUserAIContextSettings(
  userId: string
): Promise<UserAIContextSettings> {
  const settings = await prisma.userAIContextSettings.findUnique({
    where: { userId },
  });

  // Return defaults if no settings exist
  if (!settings) {
    return {
      id: "",
      userId,
      enableOrgProfileChat: true,
      enableOrgProfileEditor: true,
      enableKnowledgeBaseChat: true,
      enableKnowledgeBaseEditor: true,
      enableGrantSearchChat: true,
      enableGrantSearchEditor: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return settings;
}

/**
 * Check if a specific context is enabled for a given assistant type
 */
export function isContextEnabled(
  settings: UserAIContextSettings | null,
  context: "organization_profile" | "knowledge_base" | "grant_search",
  assistant: "chat" | "editor"
): boolean {
  // Default to enabled if no settings
  if (!settings) return true;

  const fieldMap: {
    [key: string]: keyof UserAIContextSettings;
  } = {
    "organization_profile-chat": "enableOrgProfileChat",
    "organization_profile-editor": "enableOrgProfileEditor",
    "knowledge_base-chat": "enableKnowledgeBaseChat",
    "knowledge_base-editor": "enableKnowledgeBaseEditor",
    "grant_search-chat": "enableGrantSearchChat",
    "grant_search-editor": "enableGrantSearchEditor",
  };

  const field = fieldMap[`${context}-${assistant}`];
  return field ? (settings[field] as boolean) : true;
}

/**
 * Get default settings object
 */
export function getDefaultSettings(): Omit<
  UserAIContextSettings,
  "id" | "userId" | "createdAt" | "updatedAt"
> {
  return {
    enableOrgProfileChat: true,
    enableOrgProfileEditor: true,
    enableKnowledgeBaseChat: true,
    enableKnowledgeBaseEditor: true,
    enableGrantSearchChat: true,
    enableGrantSearchEditor: true,
  };
}

