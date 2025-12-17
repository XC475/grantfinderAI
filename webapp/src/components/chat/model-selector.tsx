"use client";

import { ChevronDown, Sparkles, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AVAILABLE_MODELS,
  getAvailableModels,
  getComingSoonModels,
  getVisibleModels,
  type AIModel,
} from "@/lib/ai/models";
import type { SubscriptionTier } from "@/types/subscriptions";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  assistantType: "chat" | "editor";
  userTier?: SubscriptionTier;
  enabledModelIds?: string[] | null;
  disabled?: boolean;
  onUpgradeClick?: () => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  assistantType,
  userTier = "free",
  enabledModelIds,
  disabled,
  onUpgradeClick,
}: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
  const allAvailableModels = getAvailableModels(userTier);
  const visibleModels = getVisibleModels(
    allAvailableModels,
    enabledModelIds,
    userTier
  );
  const comingSoonModels = getComingSoonModels();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="h-8 px-2 gap-1.5 text-sm font-normal text-muted-foreground hover:text-foreground"
          aria-label="Select AI model"
        >
          <span className="flex items-center gap-1.5">
            {currentModel?.tier === "premium" && (
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
            )}
            {currentModel?.tier === "ultra-premium" && (
              <Zap className="h-3.5 w-3.5 text-purple-500" />
            )}
            <span>{currentModel?.name ?? "Select Model"}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          AI Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Available Models */}
        <div className="py-1">
          {visibleModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className="flex flex-col items-start gap-1 py-2.5"
            >
              <div className="flex items-center gap-2 w-full">
                {model.tier === "premium" && (
                  <Zap className="h-3 w-3 text-yellow-500 shrink-0" />
                )}
                {model.tier === "ultra-premium" && (
                  <Zap className="h-3 w-3 text-purple-500 shrink-0" />
                )}
                <span className="font-medium text-sm flex-1">
                  {model.name}
                </span>
                {selectedModel === model.id && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-tight">
                {model.description}
              </span>
              {model.monthlyLimit && (
                <span className="text-xs text-muted-foreground">
                  {model.monthlyLimit} requests/month
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </div>

        {/* Coming Soon Section */}
        {comingSoonModels.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Coming Soon
                </span>
              </div>
              {comingSoonModels.map((model) => (
                <div
                  key={model.id}
                  className="flex flex-col items-start gap-1 py-2 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 w-full">
                    {model.tier === "premium" && (
                      <Zap className="h-3 w-3 text-yellow-500 shrink-0" />
                    )}
                    {model.tier === "ultra-premium" && (
                      <Zap className="h-3 w-3 text-purple-500 shrink-0" />
                    )}
                    <span className="font-medium text-sm flex-1">
                      {model.name}
                    </span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Soon
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground leading-tight">
                    {model.description}
                  </span>
                  {model.requiredTier && (
                    <span className="text-xs text-muted-foreground">
                      Requires {model.requiredTier} plan
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

