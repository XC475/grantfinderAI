"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleDriveImportPickerProps {
  folderId?: string | null;
  applicationId?: string | null;
  onImported?: (documentId?: string) => void;
}

export function GoogleDriveImportPicker({
  folderId,
  applicationId,
  onImported,
}: GoogleDriveImportPickerProps) {
  const [pickerReady, setPickerReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const scriptLoadedRef = useRef(false);

  const loadPickerScript = useCallback(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      if (window.gapi) {
        window.gapi.load("picker", () => setPickerReady(true));
      }
    };
    script.onerror = () => {
      scriptLoadedRef.current = false;
      toast.error("Failed to load Google Picker");
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadPickerScript();
  }, [loadPickerScript]);

  const handleImport = async () => {
    setLoading(true);
    try {
      const statusResponse = await fetch("/api/google-drive/status");
      if (!statusResponse.ok) {
        throw new Error("Connect Google Drive to import files");
      }

      const status = await statusResponse.json();

      if (!status.connected || !status.accessToken) {
        throw new Error("Google Drive is not connected");
      }

      if (!status.pickerApiKey) {
        throw new Error("Google Picker API key is not configured");
      }

      if (!pickerReady || !window.google?.picker) {
        throw new Error("Google Picker is not ready yet");
      }

      const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false);

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setOAuthToken(status.accessToken)
        .setDeveloperKey(status.pickerApiKey)
        .setCallback(async (data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            try {
              const importResponse = await fetch("/api/google-drive/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileId: file.id,
                  fileName: file.name,
                  mimeType: file.mimeType,
                  folderId: folderId ?? null,
                  applicationId: applicationId ?? null,
                }),
              });

              if (!importResponse.ok) {
                const error = await importResponse.json().catch(() => null);
                throw new Error(error?.error || "Failed to import file");
              }

              const importData = await importResponse.json();

              toast.success("File imported from Google Drive");
              onImported?.(importData.document?.id);
            } catch (error) {
              console.error(error);
              toast.error(
                error instanceof Error ? error.message : "Failed to import file"
              );
            }
          }
        })
        .setTitle("Import from Google Drive")
        .setSize(1050, 650)
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("Google Drive import failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import from Google Drive"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleImport} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Upload className="mr-2 h-4 w-4" />
      )}
      Import from Google Drive
    </Button>
  );
}
