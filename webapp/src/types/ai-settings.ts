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
    | "selectedModelEditor";
  enabled?: boolean;
  value?: string; // For model selection updates
}

export type AIContextType =
  | "organization_profile"
  | "knowledge_base"
  | "grant_search";
export type AIAssistantType = "chat" | "editor";
