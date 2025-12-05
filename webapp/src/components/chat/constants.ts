import {
  Paperclip,
  FileText,
  Brain,
  Plus,
  SlidersHorizontal,
  ArrowUp,
  Square,
  X,
  File,
  Table,
  type LucideIcon,
} from "lucide-react";

/**
 * Button icons used throughout the message input components
 */
export const BUTTON_ICONS = {
  /** Plus button for attachments dropdown */
  plus: Plus,
  /** Settings button for settings dropdown */
  settings: SlidersHorizontal,
  /** Submit/send button arrow */
  submit: ArrowUp,
  /** Stop generation button */
  stop: Square,
  /** Close/remove button */
  close: X,
  /** Attach files menu item */
  attach: Paperclip,
  /** Add sources menu item */
  sources: FileText,
  /** AI capabilities menu item */
  aiCapabilities: Brain,
} as const;

/**
 * File type icons based on MIME type or extension
 */
export const FILE_TYPE_ICONS = {
  /** Default file icon */
  default: File,
  /** PDF documents */
  pdf: FileText,
  /** Word documents */
  docx: FileText,
  /** Plain text files */
  txt: File,
  /** CSV/spreadsheet files */
  csv: Table,
} as const;

/**
 * Icon color classes for file types
 */
export const FILE_TYPE_ICON_COLORS = {
  default: "text-muted-foreground",
  pdf: "text-red-500",
  docx: "text-blue-600",
  txt: "text-gray-600",
  csv: "text-green-600",
  unknown: "text-blue-500",
} as const;

/**
 * Icon size classes
 */
export const ICON_SIZES = {
  /** Small icons (dropdown menus) */
  sm: "h-4 w-4",
  /** Medium icons (buttons) */
  md: "h-5 w-5",
  /** Large icons */
  lg: "h-6 w-6",
} as const;

/**
 * Placeholder texts that cycle in the message input when chat is empty
 */
export const PLACEHOLDER_TEXTS = [
  "Ask anything...",
  "Help with search...",
  "Help with writing...",
  "Find grants...",
  "Get recommendations...",
] as const;

/**
 * Default placeholder for non-empty chat states
 */
export const DEFAULT_PLACEHOLDER = "Ask AI...";

/**
 * Configuration for dropdown menu items
 */
export interface DropdownItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
}

/**
 * Attachment dropdown menu items
 */
export const ATTACHMENT_MENU_ITEMS: DropdownItemConfig[] = [
  {
    id: "attach-files",
    label: "Attach files",
    icon: Paperclip,
  },
  {
    id: "add-sources",
    label: "Add sources",
    icon: FileText,
  },
];

/**
 * Settings dropdown menu items
 */
export const SETTINGS_MENU_ITEMS: DropdownItemConfig[] = [
  {
    id: "ai-capabilities",
    label: "AI Capabilities",
    icon: Brain,
  },
];

/**
 * Supported file types for upload
 */
export const SUPPORTED_FILE_TYPES = {
  accept:
    ".pdf,.docx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv",
  extensions: ["pdf", "docx", "txt", "csv"],
  mimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ],
} as const;

/**
 * Text paste threshold - if pasted text exceeds this, convert to file attachment
 */
export const TEXT_PASTE_THRESHOLD = 500;

/**
 * Input sizing configuration
 */
export const INPUT_SIZING = {
  /** Initial message input (hero/empty state) */
  initial: {
    minHeight: 120,
    textareaMinHeight: 80,
    maxHeight: 240,
    borderRadius: "rounded-3xl",
  },
  /** Conversation message input */
  conversation: {
    minHeight: 100,
    textareaMinHeight: 60,
    maxHeight: 180,
    borderRadius: "rounded-3xl",
  },
  /** Editor sidebar input */
  sidebar: {
    minHeight: undefined,
    textareaMinHeight: undefined,
    maxHeight: 240,
    borderRadius: "rounded-xl",
  },
} as const;

/**
 * Button styling configuration
 */
export const BUTTON_STYLES = {
  /** Ghost button for plus/settings */
  ghost:
    "h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
  /** Primary submit button */
  submit:
    "h-9 w-9 rounded-lg bg-[#5a8bf2] hover:bg-[#4a7bd9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center dark:bg-[#d4917c] dark:hover:bg-[#c27d68]",
  /** Stop button (when generating) */
  stop: "h-9 w-9 rounded-lg bg-[#5a8bf2] hover:bg-[#4a7bd9] transition-colors dark:bg-[#d4917c] dark:hover:bg-[#c27d68]",
  /** Sidebar variant (smaller) */
  sidebarGhost: "h-8 w-8",
  sidebarSubmit:
    "h-8 w-8 bg-[#5a8bf2] hover:bg-[#4a7bd9] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity dark:bg-[#d4917c] dark:hover:bg-[#c27d68]",
  sidebarStop:
    "h-8 w-8 bg-[#5a8bf2] hover:bg-[#4a7bd9] transition-colors dark:bg-[#d4917c] dark:hover:bg-[#c27d68]",
} as const;

/**
 * Animation timing for placeholder typing effect
 */
export const PLACEHOLDER_ANIMATION = {
  /** Milliseconds per character when typing */
  typingSpeed: 100,
  /** Milliseconds to pause after completing a phrase */
  pauseDuration: 2000,
} as const;

/**
 * Get the settings URL for the AI capabilities page
 */
export function getAISettingsUrl(slug: string): string {
  return `/private/${slug}/settings/ai`;
}

/**
 * Get the appropriate icon for a file type
 */
export function getFileTypeIcon(
  fileType?: string | null
): (typeof FILE_TYPE_ICONS)[keyof typeof FILE_TYPE_ICONS] {
  if (!fileType) return FILE_TYPE_ICONS.default;

  if (fileType === "application/pdf") return FILE_TYPE_ICONS.pdf;
  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return FILE_TYPE_ICONS.docx;
  if (fileType === "text/csv") return FILE_TYPE_ICONS.csv;
  if (fileType === "text/plain") return FILE_TYPE_ICONS.txt;

  return FILE_TYPE_ICONS.default;
}

/**
 * Get the appropriate color class for a file type icon
 */
export function getFileTypeIconColor(fileType?: string | null): string {
  if (!fileType) return FILE_TYPE_ICON_COLORS.unknown;

  if (fileType === "application/pdf") return FILE_TYPE_ICON_COLORS.pdf;
  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return FILE_TYPE_ICON_COLORS.docx;
  if (fileType === "text/csv") return FILE_TYPE_ICON_COLORS.csv;
  if (fileType === "text/plain") return FILE_TYPE_ICON_COLORS.txt;

  return FILE_TYPE_ICON_COLORS.default;
}
