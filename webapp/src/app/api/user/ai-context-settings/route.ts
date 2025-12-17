import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import {
  DEFAULT_MODEL,
  isValidModelId,
  findModelById,
  getDefaultEnabledModels,
  hasAccessToTier,
  isDefaultFreeModel,
} from "@/lib/ai/models";
import type { SubscriptionTier } from "@/types/subscriptions";

// Default settings when no record exists
const DEFAULT_SETTINGS = {
  enableOrgProfileChat: true,
  enableOrgProfileEditor: true,
  enableKnowledgeBaseChat: true,
  enableKnowledgeBaseEditor: true,
  enableGrantSearchChat: true,
  enableGrantSearchEditor: true,
  selectedModelChat: DEFAULT_MODEL,
  selectedModelEditor: DEFAULT_MODEL,
};

// GET /api/user/ai-context-settings - Get user's AI context settings
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organization to determine subscription tier
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    const organizationId = dbUser?.organizationId;
    let userTier: SubscriptionTier = "free";

    if (organizationId) {
      const subscription = await prisma.organizationSubscription.findUnique({
        where: { organizationId },
      });
      if (subscription) {
        const tierMap: Record<string, SubscriptionTier> = {
          FREE: "free",
          STARTER: "starter",
          PROFESSIONAL: "professional",
          ENTERPRISE: "enterprise",
        };
        userTier = tierMap[subscription.tier] || "free";
      }
    }

    const settings = await prisma.userAIContextSettings.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        enableOrgProfileChat: true,
        enableOrgProfileEditor: true,
        enableKnowledgeBaseChat: true,
        enableKnowledgeBaseEditor: true,
        enableGrantSearchChat: true,
        enableGrantSearchEditor: true,
        selectedModelChat: true,
        selectedModelEditor: true,
        enabledModelsChat: true,
        enabledModelsEditor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no settings exist, return defaults
    if (!settings) {
      const defaultEnabledModels = getDefaultEnabledModels(userTier);
      return NextResponse.json({
        ...DEFAULT_SETTINGS,
        enabledModelsChat: defaultEnabledModels,
        enabledModelsEditor: defaultEnabledModels,
        id: null,
        userId: user.id,
        createdAt: null,
        updatedAt: null,
      });
    }

    // Parse JSON fields and provide defaults if null
    // Prisma returns JSON fields as JsonValue, which can be JsonArray, JsonObject, string, number, boolean, or null
    let enabledModelsChat: string[];
    if (settings.enabledModelsChat === null || settings.enabledModelsChat === undefined) {
      enabledModelsChat = getDefaultEnabledModels(userTier);
    } else {
      // Handle both array and JSON string formats
      if (Array.isArray(settings.enabledModelsChat)) {
        // Type guard: ensure all elements are strings
        enabledModelsChat = settings.enabledModelsChat.filter((item): item is string => typeof item === 'string');
      } else if (typeof settings.enabledModelsChat === 'string') {
        try {
          const parsed = JSON.parse(settings.enabledModelsChat);
          enabledModelsChat = Array.isArray(parsed) 
            ? parsed.filter((item): item is string => typeof item === 'string')
            : getDefaultEnabledModels(userTier);
        } catch {
          enabledModelsChat = getDefaultEnabledModels(userTier);
        }
      } else {
        enabledModelsChat = getDefaultEnabledModels(userTier);
      }
    }

    let enabledModelsEditor: string[];
    if (settings.enabledModelsEditor === null || settings.enabledModelsEditor === undefined) {
      enabledModelsEditor = getDefaultEnabledModels(userTier);
    } else {
      // Handle both array and JSON string formats
      if (Array.isArray(settings.enabledModelsEditor)) {
        // Type guard: ensure all elements are strings
        enabledModelsEditor = settings.enabledModelsEditor.filter((item): item is string => typeof item === 'string');
      } else if (typeof settings.enabledModelsEditor === 'string') {
        try {
          const parsed = JSON.parse(settings.enabledModelsEditor);
          enabledModelsEditor = Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : getDefaultEnabledModels(userTier);
        } catch {
          enabledModelsEditor = getDefaultEnabledModels(userTier);
        }
      } else {
        enabledModelsEditor = getDefaultEnabledModels(userTier);
      }
    }

    return NextResponse.json({
      ...settings,
      enabledModelsChat,
      enabledModelsEditor,
    });
  } catch (error) {
    console.error("Error fetching AI context settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch AI context settings";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/user/ai-context-settings - Update user's AI context settings
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organization to determine subscription tier
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    const organizationId = dbUser?.organizationId;
    let userTier: SubscriptionTier = "free";

    if (organizationId) {
      const subscription = await prisma.organizationSubscription.findUnique({
        where: { organizationId },
      });
      if (subscription) {
        const tierMap: Record<string, SubscriptionTier> = {
          FREE: "free",
          STARTER: "starter",
          PROFESSIONAL: "professional",
          ENTERPRISE: "enterprise",
        };
        userTier = tierMap[subscription.tier] || "free";
      }
    }

    const body = await request.json();
    const { field, enabled, value, modelId, assistantType } = body;

    // Validate field name
    const booleanFields = [
      "enableOrgProfileChat",
      "enableOrgProfileEditor",
      "enableKnowledgeBaseChat",
      "enableKnowledgeBaseEditor",
      "enableGrantSearchChat",
      "enableGrantSearchEditor",
    ];

    const modelFields = ["selectedModelChat", "selectedModelEditor"];
    const visibilityFields = ["toggleModelVisibility"];

    const validFields = [...booleanFields, ...modelFields, ...visibilityFields];

    if (!field || !validFields.includes(field)) {
      return NextResponse.json(
        { error: "Invalid field name" },
        { status: 400 }
      );
    }

    // Handle model visibility toggle
    if (field === "toggleModelVisibility") {
      if (!modelId || typeof modelId !== "string") {
        return NextResponse.json(
          { error: "modelId is required and must be a string" },
          { status: 400 }
        );
      }

      if (!assistantType || (assistantType !== "chat" && assistantType !== "editor")) {
        return NextResponse.json(
          { error: "assistantType must be 'chat' or 'editor'" },
          { status: 400 }
        );
      }

      if (typeof enabled !== "boolean") {
        return NextResponse.json(
          { error: "enabled must be a boolean" },
          { status: 400 }
        );
      }

      // Validate model exists and user has access
      const model = findModelById(modelId);
      if (!model) {
        return NextResponse.json(
          { error: `Model not found: ${modelId}` },
          { status: 400 }
        );
      }

      // Prevent disabling the default free model
      if (!enabled && isDefaultFreeModel(modelId)) {
        return NextResponse.json(
          { error: "Cannot disable the default free model. This model must always be enabled." },
          { status: 400 }
        );
      }

      if (model.requiredTier && !hasAccessToTier(userTier, model.requiredTier)) {
        return NextResponse.json(
          { error: "User does not have access to this model" },
          { status: 403 }
        );
      }

      // Get current settings
      const currentSettings = await prisma.userAIContextSettings.findUnique({
        where: { userId: user.id },
        select: {
          enabledModelsChat: true,
          enabledModelsEditor: true,
        },
      });

      const enabledField =
        assistantType === "chat" ? "enabledModelsChat" : "enabledModelsEditor";

      // Get current enabled models or default to all available
      let currentEnabled: string[] = [];
      if (currentSettings) {
        const currentValue = currentSettings[enabledField];
        if (currentValue !== null && currentValue !== undefined) {
          // Handle both array and JSON string formats
          if (Array.isArray(currentValue)) {
            // Type guard: ensure all elements are strings
            currentEnabled = currentValue.filter((item): item is string => typeof item === 'string');
          } else if (typeof currentValue === 'string') {
            try {
              const parsed = JSON.parse(currentValue);
              currentEnabled = Array.isArray(parsed)
                ? parsed.filter((item): item is string => typeof item === 'string')
                : getDefaultEnabledModels(userTier);
            } catch {
              currentEnabled = getDefaultEnabledModels(userTier);
            }
          } else {
            currentEnabled = getDefaultEnabledModels(userTier);
          }
        } else {
          currentEnabled = getDefaultEnabledModels(userTier);
        }
      } else {
        currentEnabled = getDefaultEnabledModels(userTier);
      }

      // Add or remove model from list
      let updatedEnabled: string[];
      if (enabled) {
        // Add model if not already present
        updatedEnabled = currentEnabled.includes(modelId)
          ? currentEnabled
          : [...currentEnabled, modelId];
      } else {
        // Remove model from list, but always keep the default free model
        updatedEnabled = currentEnabled.filter((id) => id !== modelId);
        
        // Ensure default free model is always included
        if (!updatedEnabled.includes(DEFAULT_MODEL)) {
          updatedEnabled.push(DEFAULT_MODEL);
        }
      }

      // Use upsert to create or update settings
      const updatedSettings = await prisma.userAIContextSettings.upsert({
        where: { userId: user.id },
        update: {
          [enabledField]: updatedEnabled,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          ...DEFAULT_SETTINGS,
          enabledModelsChat: getDefaultEnabledModels(userTier),
          enabledModelsEditor: getDefaultEnabledModels(userTier),
          [enabledField]: updatedEnabled,
        },
        select: {
          id: true,
          userId: true,
          enableOrgProfileChat: true,
          enableOrgProfileEditor: true,
          enableKnowledgeBaseChat: true,
          enableKnowledgeBaseEditor: true,
          enableGrantSearchChat: true,
          enableGrantSearchEditor: true,
          selectedModelChat: true,
          selectedModelEditor: true,
          enabledModelsChat: true,
          enabledModelsEditor: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Parse JSON fields for response
      let enabledModelsChat: string[];
      if (updatedSettings.enabledModelsChat === null || updatedSettings.enabledModelsChat === undefined) {
        enabledModelsChat = getDefaultEnabledModels(userTier);
      } else {
        if (Array.isArray(updatedSettings.enabledModelsChat)) {
          enabledModelsChat = updatedSettings.enabledModelsChat.filter((item): item is string => typeof item === 'string');
        } else if (typeof updatedSettings.enabledModelsChat === 'string') {
          try {
            const parsed = JSON.parse(updatedSettings.enabledModelsChat);
            enabledModelsChat = Array.isArray(parsed)
              ? parsed.filter((item): item is string => typeof item === 'string')
              : getDefaultEnabledModels(userTier);
          } catch {
            enabledModelsChat = getDefaultEnabledModels(userTier);
          }
        } else {
          enabledModelsChat = getDefaultEnabledModels(userTier);
        }
      }

      let enabledModelsEditor: string[];
      if (updatedSettings.enabledModelsEditor === null || updatedSettings.enabledModelsEditor === undefined) {
        enabledModelsEditor = getDefaultEnabledModels(userTier);
      } else {
        if (Array.isArray(updatedSettings.enabledModelsEditor)) {
          enabledModelsEditor = updatedSettings.enabledModelsEditor.filter((item): item is string => typeof item === 'string');
        } else if (typeof updatedSettings.enabledModelsEditor === 'string') {
          try {
            const parsed = JSON.parse(updatedSettings.enabledModelsEditor);
            enabledModelsEditor = Array.isArray(parsed)
              ? parsed.filter((item): item is string => typeof item === 'string')
              : getDefaultEnabledModels(userTier);
          } catch {
            enabledModelsEditor = getDefaultEnabledModels(userTier);
          }
        } else {
          enabledModelsEditor = getDefaultEnabledModels(userTier);
        }
      }

      return NextResponse.json({
        ...updatedSettings,
        enabledModelsChat,
        enabledModelsEditor,
      });
    }

    // Validate and prepare update value for other fields
    let updateValue: boolean | string;
    if (booleanFields.includes(field)) {
      if (typeof enabled !== "boolean") {
        return NextResponse.json(
          { error: "enabled must be a boolean for boolean fields" },
          { status: 400 }
        );
      }
      updateValue = enabled;
    } else if (modelFields.includes(field)) {
      if (typeof value !== "string" || !value) {
        return NextResponse.json(
          { error: "value must be a non-empty string for model fields" },
          { status: 400 }
        );
      }
      // Validate model ID
      if (!isValidModelId(value)) {
        return NextResponse.json(
          { error: `Invalid model ID: ${value}` },
          { status: 400 }
        );
      }
      updateValue = value;
    } else {
      return NextResponse.json(
        { error: "Invalid field type" },
        { status: 400 }
      );
    }

    // Use upsert to create or update settings
    const updatedSettings = await prisma.userAIContextSettings.upsert({
      where: { userId: user.id },
      update: {
        [field]: updateValue,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        ...DEFAULT_SETTINGS,
        enabledModelsChat: getDefaultEnabledModels(userTier),
        enabledModelsEditor: getDefaultEnabledModels(userTier),
        [field]: updateValue,
      },
      select: {
        id: true,
        userId: true,
        enableOrgProfileChat: true,
        enableOrgProfileEditor: true,
        enableKnowledgeBaseChat: true,
        enableKnowledgeBaseEditor: true,
        enableGrantSearchChat: true,
        enableGrantSearchEditor: true,
        selectedModelChat: true,
        selectedModelEditor: true,
        enabledModelsChat: true,
        enabledModelsEditor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse JSON fields for response
    let enabledModelsChat: string[];
    if (updatedSettings.enabledModelsChat === null || updatedSettings.enabledModelsChat === undefined) {
      enabledModelsChat = getDefaultEnabledModels(userTier);
    } else {
      if (Array.isArray(updatedSettings.enabledModelsChat)) {
        enabledModelsChat = updatedSettings.enabledModelsChat.filter((item): item is string => typeof item === 'string');
      } else if (typeof updatedSettings.enabledModelsChat === 'string') {
        try {
          const parsed = JSON.parse(updatedSettings.enabledModelsChat);
          enabledModelsChat = Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : getDefaultEnabledModels(userTier);
        } catch {
          enabledModelsChat = getDefaultEnabledModels(userTier);
        }
      } else {
        enabledModelsChat = getDefaultEnabledModels(userTier);
      }
    }

    let enabledModelsEditor: string[];
    if (updatedSettings.enabledModelsEditor === null || updatedSettings.enabledModelsEditor === undefined) {
      enabledModelsEditor = getDefaultEnabledModels(userTier);
    } else {
      if (Array.isArray(updatedSettings.enabledModelsEditor)) {
        enabledModelsEditor = updatedSettings.enabledModelsEditor.filter((item): item is string => typeof item === 'string');
      } else if (typeof updatedSettings.enabledModelsEditor === 'string') {
        try {
          const parsed = JSON.parse(updatedSettings.enabledModelsEditor);
          enabledModelsEditor = Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : getDefaultEnabledModels(userTier);
        } catch {
          enabledModelsEditor = getDefaultEnabledModels(userTier);
        }
      } else {
        enabledModelsEditor = getDefaultEnabledModels(userTier);
      }
    }

    return NextResponse.json({
      ...updatedSettings,
      enabledModelsChat,
      enabledModelsEditor,
    });
  } catch (error) {
    console.error("Error updating AI context settings:", error);
    return NextResponse.json(
      { error: "Failed to update AI context settings" },
      { status: 500 }
    );
  }
}
