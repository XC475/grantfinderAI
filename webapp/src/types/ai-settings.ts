export interface UserAIContextSettings {
  id: string;
  userId: string;
  enableOrgProfileChat: boolean;
  enableOrgProfileEditor: boolean;
  enableKnowledgeBaseChat: boolean;
  enableKnowledgeBaseEditor: boolean;
  enableGrantSearchChat: boolean;
  enableGrantSearchEditor: boolean;
  selectedModelChat: string;
  selectedModelEditor: string;
  enabledModelsChat: string[] | null;
  enabledModelsEditor: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIContextUpdateRequest {
  field:
    | "enableOrgProfileChat"
    | "enableOrgProfileEditor"
    | "enableKnowledgeBaseChat"
    | "enableKnowledgeBaseEditor"
    | "enableGrantSearchChat"
    | "enableGrantSearchEditor"
    | "selectedModelChat"
    | "selectedModelEditor"
    | "toggleModelVisibility";
  enabled?: boolean;
  value?: string; // For model selection updates
  modelId?: string; // For model visibility toggles
  assistantType?: "chat" | "editor"; // For model visibility toggles
}

export type AIContextType =
  | "organization_profile"
  | "knowledge_base"
  | "grant_search";
export type AIAssistantType = "chat" | "editor";
