"use client";

import { Loader2, Building2, Brain, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAISettings, type AISettingsField } from "@/hooks/use-ai-settings";
import { BUTTON_ICONS, ICON_SIZES } from "./constants";

export type AIAssistantType = "chat" | "editor";

interface AISettingsDropdownProps {
  /** Which assistant type to show settings for */
  assistantType: AIAssistantType;
  /** Whether to disable the trigger button */
  disabled?: boolean;
  /** Additional class name for the trigger button */
  className?: string;
  /** Size variant */
  size?: "default" | "small";
  /** Alignment of the dropdown */
  align?: "start" | "end";
  /** Trigger style */
  triggerVariant?: "icon" | "button";
  /** Optional label when using button trigger */
  triggerLabel?: string;
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  loading: boolean;
  onToggle: () => void;
}

function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  loading,
  onToggle,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">{label}</p>
          <p className="text-xs text-muted-foreground leading-tight truncate">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {loading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={checked}
          onCheckedChange={onToggle}
          disabled={loading}
          className="scale-90"
        />
      </div>
    </div>
  );
}

/**
 * Dropdown menu with AI capability toggles for chat or editor assistant.
 * Shows Organization Profile, Knowledge Base, and Grant Search toggles.
 */
export function AISettingsDropdown({
  assistantType,
  disabled = false,
  className,
  size = "default",
  align = "start",
  triggerVariant = "icon",
  triggerLabel,
}: AISettingsDropdownProps) {
  const { settings, loading, updating, toggleSetting } = useAISettings();

  // Get the field names based on assistant type
  const fields: Record<string, AISettingsField> =
    assistantType === "chat"
      ? {
          orgProfile: "enableOrgProfileChat",
          knowledgeBase: "enableKnowledgeBaseChat",
          grantSearch: "enableGrantSearchChat",
        }
      : {
          orgProfile: "enableOrgProfileEditor",
          knowledgeBase: "enableKnowledgeBaseEditor",
          grantSearch: "enableGrantSearchEditor",
        };

  const isSmall = size === "small";
  const iconSize = isSmall ? "h-4 w-4" : ICON_SIZES.md;
  const buttonSize = isSmall ? "h-8 w-8" : "h-9 w-9";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerVariant === "button" ? (
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-between text-sm font-normal ${className || ""}`}
            aria-label="AI Settings"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <BUTTON_ICONS.settings className="h-4 w-4" />
              {triggerLabel ?? "AI capabilities"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`${buttonSize} rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${className || ""}`}
            aria-label="AI Settings"
            disabled={disabled}
          >
            <BUTTON_ICONS.settings className={iconSize} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-72">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          AI Capabilities
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : settings ? (
          <div className="py-1">
            <SettingRow
              icon={Building2}
              label="Organization Profile"
              description="Name, mission, budget info"
              checked={settings[fields.orgProfile]}
              loading={updating[fields.orgProfile] || false}
              onToggle={() => toggleSetting(fields.orgProfile)}
            />
            <SettingRow
              icon={Brain}
              label="Knowledge Base"
              description="Your uploaded documents"
              checked={settings[fields.knowledgeBase]}
              loading={updating[fields.knowledgeBase] || false}
              onToggle={() => toggleSetting(fields.knowledgeBase)}
            />
            <SettingRow
              icon={Search}
              label="Grant Search"
              description="Find matching grants"
              checked={settings[fields.grantSearch]}
              loading={updating[fields.grantSearch] || false}
              onToggle={() => toggleSetting(fields.grantSearch)}
            />
          </div>
        ) : (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Failed to load settings
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

