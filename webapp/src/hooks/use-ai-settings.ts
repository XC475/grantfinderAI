"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  UserAIContextSettings,
  AIContextUpdateRequest,
} from "@/types/ai-settings";
import { DEFAULT_MODEL, isValidModelId, findModelById } from "@/lib/ai/models";

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
  enabledModelsChat: null,
  enabledModelsEditor: null,
};

export type AISettingsField = AIContextUpdateRequest["field"];

interface UseAISettingsReturn {
  settings: UserAIContextSettings | null;
  loading: boolean;
  updating: Record<string, boolean>;
  toggleSetting: (field: AISettingsField) => Promise<void>;
  changeModel: (assistantType: "chat" | "editor", modelId: string) => Promise<void>;
  toggleModelVisibility: (
    assistantType: "chat" | "editor",
    modelId: string,
    enabled: boolean
  ) => Promise<void>;
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to fetch settings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching AI context settings:", error);
      // Use defaults on error
      // Use a fixed date to avoid hydration mismatches
      const now = new Date();
      setSettings({
        ...DEFAULT_SETTINGS,
        enabledModelsChat: null,
        enabledModelsEditor: null,
        id: "",
        userId: "",
        createdAt: now,
        updatedAt: now,
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

      // TypeScript type narrowing - field is now a boolean field
      type BooleanField = Extract<
        AISettingsField,
        | "enableOrgProfileChat"
        | "enableOrgProfileEditor"
        | "enableKnowledgeBaseChat"
        | "enableKnowledgeBaseEditor"
        | "enableGrantSearchChat"
        | "enableGrantSearchEditor"
      >;
      const booleanField = field as BooleanField;
      const currentValue = settings[booleanField] as boolean;
      const newValue = !currentValue;

      // Optimistic update
      setSettings((prev) => (prev ? { ...prev, [booleanField]: newValue } : prev));
      setUpdating((prev) => ({ ...prev, [booleanField]: true }));

      try {
        const response = await fetch("/api/user/ai-context-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: booleanField, enabled: newValue }),
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
        const labels: Partial<Record<AISettingsField, string>> = {
          enableOrgProfileChat: "Organization Profile",
          enableOrgProfileEditor: "Organization Profile",
          enableKnowledgeBaseChat: "Knowledge Base",
          enableKnowledgeBaseEditor: "Knowledge Base",
          enableGrantSearchChat: "Grant Search",
          enableGrantSearchEditor: "Grant Search",
          selectedModelChat: "Chat Model",
          selectedModelEditor: "Editor Model",
        };

        const label = labels[field];
        if (label) {
          toast.success(`${newValue ? "Enabled" : "Disabled"} ${label}`);
        }
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

  const toggleModelVisibility = useCallback(
    async (
      assistantType: "chat" | "editor",
      modelId: string,
      enabled: boolean
    ) => {
      if (!settings) return;

      // Validate model ID
      const model = findModelById(modelId);
      if (!model) {
        toast.error(`Model not found: ${modelId}`);
        return;
      }

      const enabledField =
        assistantType === "chat" ? "enabledModelsChat" : "enabledModelsEditor";
      const currentEnabled = settings[enabledField] || [];

      // Optimistic update
      let updatedEnabled: string[];
      if (enabled) {
        updatedEnabled = currentEnabled.includes(modelId)
          ? currentEnabled
          : [...currentEnabled, modelId];
      } else {
        updatedEnabled = currentEnabled.filter((id) => id !== modelId);
      }

      setSettings((prev) =>
        prev ? { ...prev, [enabledField]: updatedEnabled } : prev
      );
      setUpdating((prev) => ({ ...prev, [`${enabledField}-${modelId}`]: true }));

      try {
        const response = await fetch("/api/user/ai-context-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: "toggleModelVisibility",
            modelId,
            assistantType,
            enabled,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update model visibility");
        }

        const updatedSettings = await response.json();
        setSettings(updatedSettings);

        // Broadcast to other instances
        window.dispatchEvent(
          new CustomEvent(AI_SETTINGS_UPDATED_EVENT, { detail: updatedSettings })
        );

        toast.success(
          `${model.name} ${enabled ? "enabled" : "disabled"} for ${assistantType} assistant`
        );
      } catch (error) {
        console.error("Error updating model visibility:", error);
        // Revert optimistic update on error
        setSettings((prev) =>
          prev ? { ...prev, [enabledField]: currentEnabled } : prev
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update model visibility"
        );
      } finally {
        setUpdating((prev) => ({
          ...prev,
          [`${enabledField}-${modelId}`]: false,
        }));
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
    toggleModelVisibility,
    refetch: fetchSettings,
  };
}
