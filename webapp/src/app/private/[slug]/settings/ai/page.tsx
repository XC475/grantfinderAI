"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Building2,
  Brain,
  Search,
  MessageSquare,
  FileEdit,
  Zap,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserAIContextSettings } from "@/types/ai-settings";
import { useAISettings } from "@/hooks/use-ai-settings";
import { useSubscription } from "@/hooks/use-subscription";
import {
  AVAILABLE_MODELS,
  getAllModelsForTier,
  findModelById,
  isDefaultFreeModel,
  hasAccessToTier,
  type AIModel,
} from "@/lib/ai/models";
import { useParams } from "next/navigation";

type ContextField =
  | "enableOrgProfileChat"
  | "enableOrgProfileEditor"
  | "enableKnowledgeBaseChat"
  | "enableKnowledgeBaseEditor"
  | "enableGrantSearchChat"
  | "enableGrantSearchEditor";

export default function AISettingsPage() {
  const params = useParams();
  const organizationSlug = params.slug as string;
  const [organizationId, setOrganizationId] = useState<string | undefined>(
    undefined
  );
  const {
    settings,
    toggleSetting,
    toggleModelVisibility,
    loading: loadingAISettings,
  } = useAISettings();
  const { tier, loading: loadingSubscription } = useSubscription(organizationId);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  // Fetch organization ID from slug
  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        const response = await fetch(`/api/organizations?slug=${organizationSlug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.id) {
            setOrganizationId(data.id);
          }
        }
      } catch (error) {
        console.error("Error fetching organization ID:", error);
      }
    };
    if (organizationSlug) {
      fetchOrgId();
    }
  }, [organizationSlug]);

  // Group models by tier
  const allModelsForTier = getAllModelsForTier(tier);
  // Get all coming soon models regardless of tier (for visibility)
  const allComingSoonModels = AVAILABLE_MODELS.filter(
    (m) => m.comingSoon && !m.available
  );

  // Combine tier-accessible models with coming soon models (avoid duplicates)
  const allVisibleModels = [
    ...allModelsForTier,
    ...allComingSoonModels.filter(
      (m) => !allModelsForTier.some((tm) => tm.id === m.id)
    ),
  ];

  const modelsByTier = {
    standard: allVisibleModels.filter((m) => m.tier === "standard"),
    premium: allVisibleModels.filter((m) => m.tier === "premium"),
    "ultra-premium": allVisibleModels.filter((m) => m.tier === "ultra-premium"),
  };

  const handleToggle = async (field: ContextField) => {
    await toggleSetting(field);
  };

  const handleModelVisibilityToggle = async (
    assistantType: "chat" | "editor",
    modelId: string,
    enabled: boolean
  ) => {
    if (!settings) return;

    const updateKey = `${assistantType}-${modelId}`;
    setUpdating((prev) => ({ ...prev, [updateKey]: true }));

    try {
      await toggleModelVisibility(assistantType, modelId, enabled);
    } catch (error) {
      console.error("Error toggling model visibility:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [updateKey]: false }));
    }
  };

  const isModelEnabled = (
    assistantType: "chat" | "editor",
    modelId: string
  ): boolean => {
    // Default free model is always enabled
    if (isDefaultFreeModel(modelId)) {
      return true;
    }
    
    if (!settings) return false;
    const enabledModels =
      assistantType === "chat"
        ? settings.enabledModelsChat
        : settings.enabledModelsEditor;
    // If null, all available models are enabled by default
    if (enabledModels === null) {
      const model = findModelById(modelId);
      return model?.available === true;
    }
    return enabledModels.includes(modelId);
  };

  const canToggleModel = (model: AIModel): boolean => {
    // Can't toggle coming soon models
    if (model.comingSoon || !model.available) return false;
    
    // Cannot disable the default free model
    if (isDefaultFreeModel(model.id)) return false;
    
    // Can toggle if user has access to the tier
    if (!model.requiredTier) return true;
    const tierOrder: Record<string, number> = {
      free: 0,
      starter: 1,
      professional: 2,
      enterprise: 3,
    };
    return tierOrder[tier] >= tierOrder[model.requiredTier];
  };

  if (loadingAISettings || loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-3xl font-bold">AI Capabilities</h1>
          <p className="text-muted-foreground">
            Configure AI assistant settings and capabilities
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Failed to load settings. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Capabilities</h1>
        <p className="text-muted-foreground">
          Control which context types are available to each AI assistant
        </p>
      </div>

      {/* Chat Assistant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Chat Assistant</CardTitle>
          </div>
          <CardDescription>
            General grant discovery and assistance. Control which context types
            are available when using the chat assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Organization Profile Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Organization Profile</p>
                <p className="text-sm text-muted-foreground">
                  Organization name, mission, budget, and profile information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableOrgProfileChat && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableOrgProfileChat}
                onCheckedChange={() => handleToggle("enableOrgProfileChat")}
                disabled={updating.enableOrgProfileChat}
              />
            </div>
          </div>

          <Separator />

          {/* Knowledge Base Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Knowledge Base</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded documents marked as knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableKnowledgeBaseChat && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableKnowledgeBaseChat}
                onCheckedChange={() => handleToggle("enableKnowledgeBaseChat")}
                disabled={updating.enableKnowledgeBaseChat}
              />
            </div>
          </div>

          <Separator />

          {/* Grant Search Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Grant Search</p>
                <p className="text-sm text-muted-foreground">
                  Search and recommend grant opportunities from database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableGrantSearchChat && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableGrantSearchChat}
                onCheckedChange={() => handleToggle("enableGrantSearchChat")}
                disabled={updating.enableGrantSearchChat}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Assistant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            <CardTitle>Editor Assistant</CardTitle>
          </div>
          <CardDescription>
            Document writing and editing support. Control which context types
            are available when using the editor assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Organization Profile Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Organization Profile</p>
                <p className="text-sm text-muted-foreground">
                  Organization name, mission, budget, and profile information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableOrgProfileEditor && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableOrgProfileEditor}
                onCheckedChange={() => handleToggle("enableOrgProfileEditor")}
                disabled={updating.enableOrgProfileEditor}
              />
            </div>
          </div>

          <Separator />

          {/* Knowledge Base Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Knowledge Base</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded documents marked as knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableKnowledgeBaseEditor && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableKnowledgeBaseEditor}
                onCheckedChange={() => handleToggle("enableKnowledgeBaseEditor")}
                disabled={updating.enableKnowledgeBaseEditor}
              />
            </div>
          </div>

          <Separator />

          {/* Grant Search Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Grant Search</p>
                <p className="text-sm text-muted-foreground">
                  Search and recommend grant opportunities from database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableGrantSearchEditor && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableGrantSearchEditor}
                onCheckedChange={() => handleToggle("enableGrantSearchEditor")}
                disabled={updating.enableGrantSearchEditor}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Visibility Card */}
      <Card>
        <CardHeader>
          <CardTitle>Model Visibility</CardTitle>
          <CardDescription>
            Choose which models appear in the model selector for each assistant.
            Only enabled models will be visible in the dropdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chat Assistant Models */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Assistant Models
            </h3>
            <div className="space-y-4">
              {/* Standard Models */}
              {modelsByTier.standard.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Standard
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier.standard.map((model) => {
                      const isEnabled = isModelEnabled("chat", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `chat-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {isDefaultFreeModel(model.id) && (
                                <Badge variant="outline" className="text-xs">
                                  Default
                                </Badge>
                              )}
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                              {isDefaultFreeModel(model.id) && (
                                <span className="block mt-1 italic">
                                  This is the default free model and cannot be disabled.
                                </span>
                              )}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "chat",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Premium Models */}
              {modelsByTier.premium.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Premium
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier.premium.map((model) => {
                      const isEnabled = isModelEnabled("chat", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `chat-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "chat",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ultra-Premium Models */}
              {modelsByTier["ultra-premium"].length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-purple-500" />
                    Ultra-Premium
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier["ultra-premium"].map((model) => {
                      const isEnabled = isModelEnabled("chat", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `chat-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "chat",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Editor Assistant Models */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Editor Assistant Models
            </h3>
            <div className="space-y-4">
              {/* Standard Models */}
              {modelsByTier.standard.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Standard
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier.standard.map((model) => {
                      const isEnabled = isModelEnabled("editor", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `editor-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {isDefaultFreeModel(model.id) && (
                                <Badge variant="outline" className="text-xs">
                                  Default
                                </Badge>
                              )}
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                              {isDefaultFreeModel(model.id) && (
                                <span className="block mt-1 italic">
                                  This is the default free model and cannot be disabled.
                                </span>
                              )}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "editor",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Premium Models */}
              {modelsByTier.premium.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Premium
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier.premium.map((model) => {
                      const isEnabled = isModelEnabled("editor", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `editor-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "editor",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ultra-Premium Models */}
              {modelsByTier["ultra-premium"].length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-purple-500" />
                    Ultra-Premium
                  </h4>
                  <div className="space-y-3">
                    {modelsByTier["ultra-premium"].map((model) => {
                      const isEnabled = isModelEnabled("editor", model.id);
                      const canToggle = canToggleModel(model);
                      const updateKey = `editor-${model.id}`;
                      return (
                        <div
                          key={model.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                              <span className="font-medium text-sm">
                                {model.name}
                              </span>
                              {model.comingSoon && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                              {model.comingSoon &&
                                model.requiredTier &&
                                !hasAccessToTier(tier, model.requiredTier) && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires {model.requiredTier} plan
                                  </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {model.description}
                            </p>
                            {model.monthlyLimit && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {model.monthlyLimit} requests/month
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {updating[updateKey] && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) =>
                                handleModelVisibilityToggle(
                                  "editor",
                                  model.id,
                                  checked
                                )
                              }
                              disabled={!canToggle || updating[updateKey]}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
