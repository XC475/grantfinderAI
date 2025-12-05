// Components
export { InitialMessageInput, HeroChatInput } from "./initial-message-input";
export { MessageInput } from "./message-input";
export { Chat, ChatContainer, ChatMessages, ChatForm } from "./chat-container";
export { ChatMessage } from "./chat-message";
export type { Message, ChatMessageProps } from "./chat-message";
export { MessageList } from "./message-list";
export { PromptSuggestions } from "./prompt-suggestions";
export { ChatDemo, ChatDemo as ChatComponent } from "./Chat";
export { SourcesModal } from "./SourcesModal";
export type { SourceDocument } from "./SourcesModal";
export { ChatGreeting } from "./ChatGreeting";
export { AISettingsDropdown } from "./ai-settings-dropdown";
export type { AIAssistantType } from "./ai-settings-dropdown";

// Constants
export {
  // Placeholder configuration
  PLACEHOLDER_TEXTS,
  DEFAULT_PLACEHOLDER,
  PLACEHOLDER_ANIMATION,
  // Menu items
  ATTACHMENT_MENU_ITEMS,
  SETTINGS_MENU_ITEMS,
  // Icons
  BUTTON_ICONS,
  FILE_TYPE_ICONS,
  FILE_TYPE_ICON_COLORS,
  ICON_SIZES,
  // File types
  SUPPORTED_FILE_TYPES,
  TEXT_PASTE_THRESHOLD,
  // Sizing & styling
  INPUT_SIZING,
  BUTTON_STYLES,
  // Helper functions
  getAISettingsUrl,
  getFileTypeIcon,
  getFileTypeIconColor,
  // Types
  type DropdownItemConfig,
} from "./constants";
