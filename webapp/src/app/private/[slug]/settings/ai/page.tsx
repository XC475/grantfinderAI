"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Building2,
  Brain,
  Search,
  MessageSquare,
  FileEdit,
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
import { toast } from "sonner";
import { UserAIContextSettings } from "@/types/ai-settings";

type ContextField =
  | "enableOrgProfileChat"
  | "enableOrgProfileEditor"
  | "enableKnowledgeBaseChat"
  | "enableKnowledgeBaseEditor"
  | "enableGrantSearchChat"
  | "enableGrantSearchEditor";

export default function AISettingsPage() {
  const [settings, setSettings] = useState<UserAIContextSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/ai-context-settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching AI context settings:", error);
      toast.error("Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: ContextField, currentValue: boolean) => {
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
      toast.success(
        `${newValue ? "Enabled" : "Disabled"} ${getFieldLabel(field)}`
      );
    } catch (error) {
      console.error("Error updating settings:", error);
      // Revert optimistic update on error
      setSettings((prev) => (prev ? { ...prev, [field]: currentValue } : prev));
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    } finally {
      setUpdating((prev) => ({ ...prev, [field]: false }));
    }
  };

  const getFieldLabel = (field: ContextField): string => {
    const labels: { [key in ContextField]: string } = {
      enableOrgProfileChat: "Organization Profile for Chat Assistant",
      enableOrgProfileEditor: "Organization Profile for Editor Assistant",
      enableKnowledgeBaseChat: "Knowledge Base for Chat Assistant",
      enableKnowledgeBaseEditor: "Knowledge Base for Editor Assistant",
      enableGrantSearchChat: "Grant Search for Chat Assistant",
      enableGrantSearchEditor: "Grant Search for Editor Assistant",
    };
    return labels[field];
  };

  if (loading) {
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
                  Organization name, mission, budget, and district information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableOrgProfileChat && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableOrgProfileChat}
                onCheckedChange={() =>
                  handleToggle(
                    "enableOrgProfileChat",
                    settings.enableOrgProfileChat
                  )
                }
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
                onCheckedChange={() =>
                  handleToggle(
                    "enableKnowledgeBaseChat",
                    settings.enableKnowledgeBaseChat
                  )
                }
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
                onCheckedChange={() =>
                  handleToggle(
                    "enableGrantSearchChat",
                    settings.enableGrantSearchChat
                  )
                }
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
                  Organization name, mission, budget, and district information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {updating.enableOrgProfileEditor && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={settings.enableOrgProfileEditor}
                onCheckedChange={() =>
                  handleToggle(
                    "enableOrgProfileEditor",
                    settings.enableOrgProfileEditor
                  )
                }
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
                onCheckedChange={() =>
                  handleToggle(
                    "enableKnowledgeBaseEditor",
                    settings.enableKnowledgeBaseEditor
                  )
                }
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
                onCheckedChange={() =>
                  handleToggle(
                    "enableGrantSearchEditor",
                    settings.enableGrantSearchEditor
                  )
                }
                disabled={updating.enableGrantSearchEditor}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
