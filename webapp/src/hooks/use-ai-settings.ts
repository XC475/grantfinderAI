"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  UserAIContextSettings,
  AIContextUpdateRequest,
} from "@/types/ai-settings";
import { DEFAULT_MODEL, isValidModelId } from "@/lib/ai/models";

// Custom event name for cross-instance sync
const AI_SETTINGS_UPDATED_EVENT = "ai-settings-updated";

// Default settings when no record exists
const DEFAULT_SETTINGS: Omit<
  UserAIContextSettings,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  enableOrgProfileChat: true,
  enableOrgProfileEditor: true,
  enableKnowledgeBaseChat: true,
  enableKnowledgeBaseEditor: true,
  enableGrantSearchChat: true,
  enableGrantSearchEditor: true,
  selectedModelChat: DEFAULT_MODEL,
  selectedModelEditor: DEFAULT_MODEL,
};

export type AISettingsField = AIContextUpdateRequest["field"];

interface UseAISettingsReturn {
  settings: UserAIContextSettings | null;
  loading: boolean;
  updating: Record<string, boolean>;
  toggleSetting: (field: AISettingsField) => Promise<void>;
  changeModel: (assistantType: "chat" | "editor", modelId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage AI context settings for chat and editor assistants
 */
export function useAISettings(): UseAISettingsReturn {
  const [settings, setSettings] = useState<UserAIContextSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/ai-context-settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching AI context settings:", error);
      // Use defaults on error
      setSettings({
        ...DEFAULT_SETTINGS,
        id: "",
        userId: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for updates from other instances
  useEffect(() => {
    const handleSettingsUpdate = (e: CustomEvent<UserAIContextSettings>) => {
      // Update local state directly from the event payload
      setSettings(e.detail);
    };

    window.addEventListener(
      AI_SETTINGS_UPDATED_EVENT,
      handleSettingsUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        AI_SETTINGS_UPDATED_EVENT,
        handleSettingsUpdate as EventListener
      );
    };
  }, []);

  const toggleSetting = useCallback(
    async (field: AISettingsField) => {
      if (!settings) return;

      // Only allow toggling boolean fields
      const booleanFields: AISettingsField[] = [
        "enableOrgProfileChat",
        "enableOrgProfileEditor",
        "enableKnowledgeBaseChat",
        "enableKnowledgeBaseEditor",
        "enableGrantSearchChat",
        "enableGrantSearchEditor",
      ];

      if (!booleanFields.includes(field)) {
        console.error("Cannot toggle non-boolean field:", field);
        return;
      }

      const currentValue = settings[field] as boolean;
      const newValue = !currentValue;

      // Optimistic update
      setSettings((prev) => (prev ? { ...prev, [field]: newValue } : prev));
      setUpdating((prev) => ({ ...prev, [field]: true }));

      try {
        const response = await fetch("/api/user/ai-context-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, enabled: newValue }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update settings");
        }

        const updatedSettings = await response.json();
        setSettings(updatedSettings);

        // Broadcast to other instances
        window.dispatchEvent(
          new CustomEvent(AI_SETTINGS_UPDATED_EVENT, { detail: updatedSettings })
        );

        // Get friendly label for toast
        const labels: Record<AISettingsField, string> = {
          enableOrgProfileChat: "Organization Profile",
          enableOrgProfileEditor: "Organization Profile",
          enableKnowledgeBaseChat: "Knowledge Base",
          enableKnowledgeBaseEditor: "Knowledge Base",
          enableGrantSearchChat: "Grant Search",
          enableGrantSearchEditor: "Grant Search",
          selectedModelChat: "Chat Model",
          selectedModelEditor: "Editor Model",
        };

        toast.success(`${newValue ? "Enabled" : "Disabled"} ${labels[field]}`);
      } catch (error) {
        console.error("Error updating settings:", error);
        // Revert optimistic update on error
        setSettings((prev) =>
          prev ? { ...prev, [field]: currentValue } : prev
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to update settings"
        );
      } finally {
        setUpdating((prev) => ({ ...prev, [field]: false }));
      }
    },
    [settings]
  );

  const changeModel = useCallback(
    async (assistantType: "chat" | "editor", modelId: string) => {
      if (!settings) return;

      // Validate model ID
      if (!isValidModelId(modelId)) {
        toast.error(`Invalid model ID: ${modelId}`);
        return;
      }

      const field: AISettingsField =
        assistantType === "chat" ? "selectedModelChat" : "selectedModelEditor";
      const currentValue = settings[field] as string;

      // Optimistic update
      setSettings((prev) => (prev ? { ...prev, [field]: modelId } : prev));
      setUpdating((prev) => ({ ...prev, [field]: true }));

      try {
        const response = await fetch("/api/user/ai-context-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: modelId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update model");
        }

        const updatedSettings = await response.json();
        setSettings(updatedSettings);

        // Broadcast to other instances
        window.dispatchEvent(
          new CustomEvent(AI_SETTINGS_UPDATED_EVENT, { detail: updatedSettings })
        );

        toast.success(`Model changed to ${modelId}`);
      } catch (error) {
        console.error("Error updating model:", error);
        // Revert optimistic update on error
        setSettings((prev) =>
          prev ? { ...prev, [field]: currentValue } : prev
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to update model"
        );
      } finally {
        setUpdating((prev) => ({ ...prev, [field]: false }));
      }
    },
    [settings]
  );

  return {
    settings,
    loading,
    updating,
    toggleSetting,
    changeModel,
    refetch: fetchSettings,
  };
}
