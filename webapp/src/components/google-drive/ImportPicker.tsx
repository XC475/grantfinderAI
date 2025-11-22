"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    gapi:
      | {
          load: (api: string, callback: () => void) => void;
        }
      | undefined;
    google:
      | {
          accounts: {
            oauth2: {
              initTokenClient: (config: unknown) => {
                requestAccessToken: () => void;
              };
            };
          };
          picker: {
            Action: { PICKED: string; CANCEL: string };
            Feature: { MULTISELECT_ENABLED: string };
            PickerBuilder: new () => PickerBuilder;
            ViewId: { DOCS: string };
            DocsView: new () => DocsView;
            DocsUploadView: new () => unknown;
          };
        }
      | undefined;
  }

  interface PickerBuilder {
    addView: (view: unknown) => PickerBuilder;
    setOAuthToken: (token: string) => PickerBuilder;
    setDeveloperKey: (key: string) => PickerBuilder;
    setCallback: (
      callback: (data: {
        action: string;
        docs?: Array<{ id: string; name: string; mimeType: string }>;
      }) => void
    ) => PickerBuilder;
    enableFeature: (feature: string) => PickerBuilder;
    setTitle: (title: string) => PickerBuilder;
    setSize: (width: number, height: number) => PickerBuilder;
    build: () => { setVisible: (visible: boolean) => void };
  }

  interface DocsView {
    setIncludeFolders: (include: boolean) => DocsView;
    setSelectFolderEnabled: (enabled: boolean) => DocsView;
  }
}

interface GoogleDriveImportPickerPropsBase {
  onImported?: (documentId?: string) => void;
  children?: (props: {
    onClick: () => void;
    loading: boolean;
  }) => React.ReactNode;
  asButton?: boolean;
}

interface GoogleDriveImportPickerFolderMode
  extends GoogleDriveImportPickerPropsBase {
  mode?: "import";
  folderId?: string | null;
  applicationId?: string | null;
}

interface GoogleDriveImportPickerChatMode
  extends GoogleDriveImportPickerPropsBase {
  mode: "attach";
  onFilesSelected: (files: File[]) => void;
}

type GoogleDriveImportPickerProps =
  | GoogleDriveImportPickerFolderMode
  | GoogleDriveImportPickerChatMode;

export function GoogleDriveImportPicker(props: GoogleDriveImportPickerProps) {
  const mode = props.mode || "import";
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
        throw new Error("Failed to check Google Drive status");
      }

      const status = await statusResponse.json();

      if (!status.connected || !status.accessToken) {
        // Not connected - redirect to auth flow
        toast.info("Connecting to Google Drive...");
        // Pass current path so we can return here after authentication
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/api/google-drive/auth?returnTo=${returnTo}`;
        return;
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

      const pickerBuilder = new window.google.picker.PickerBuilder()
        .addView(view)
        .addView(new window.google.picker.DocsUploadView())
        .setOAuthToken(status.accessToken)
        .setDeveloperKey(status.pickerApiKey);

      // Enable multi-select for chat mode
      if (mode === "attach") {
        pickerBuilder.enableFeature(
          window.google.picker.Feature.MULTISELECT_ENABLED
        );
      }

      const picker = pickerBuilder
        .setCallback(
          async (data: {
            action: string;
            docs?: Array<{ id: string; name: string; mimeType: string }>;
          }) => {
            if (data.action === window.google?.picker.Action.PICKED) {
              if (mode === "attach") {
                // Chat attachment mode - download files
                try {
                  const files = data.docs;
                  if (!files || files.length === 0) {
                    return;
                  }
                  const downloadedFiles: File[] = [];

                  for (const file of files) {
                    const downloadResponse = await fetch(
                      "/api/google-drive/download",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fileId: file.id,
                          fileName: file.name,
                          mimeType: file.mimeType,
                          asText: true, // For chat, get text content not binary files
                        }),
                      }
                    );

                    if (!downloadResponse.ok) {
                      throw new Error(`Failed to download ${file.name}`);
                    }

                    const blob = await downloadResponse.blob();
                    // Get the actual filename from Content-Disposition header
                    const contentDisposition = downloadResponse.headers.get(
                      "Content-Disposition"
                    );
                    const actualFileName = contentDisposition
                      ? contentDisposition
                          .split('filename="')[1]
                          ?.split('"')[0] || file.name
                      : file.name;

                    const actualMimeType =
                      downloadResponse.headers.get("Content-Type") ||
                      file.mimeType;

                    const downloadedFile = new File([blob], actualFileName, {
                      type: actualMimeType,
                    });

                    downloadedFiles.push(downloadedFile);
                  }

                  if (props.mode === "attach") {
                    props.onFilesSelected(downloadedFiles);
                  }
                  toast.success(
                    `${downloadedFiles.length} file(s) added from Google Drive`
                  );
                } catch (error) {
                  console.error(error);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to download files"
                  );
                }
              } else {
                // Folder import mode - import single file
                if (!data.docs || data.docs.length === 0) {
                  return;
                }
                const file = data.docs[0];
                try {
                  const importResponse = await fetch(
                    "/api/google-drive/import",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        fileId: file.id,
                        fileName: file.name,
                        mimeType: file.mimeType,
                        folderId:
                          props.mode !== "attach"
                            ? (props.folderId ?? null)
                            : null,
                        applicationId:
                          props.mode !== "attach"
                            ? (props.applicationId ?? null)
                            : null,
                      }),
                    }
                  );

                  if (!importResponse.ok) {
                    const error = await importResponse.json().catch(() => null);
                    throw new Error(error?.error || "Failed to import file");
                  }

                  const importData = await importResponse.json();

                  toast.success("File imported from Google Drive");
                  props.onImported?.(importData.document?.id);
                } catch (error) {
                  console.error(error);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to import file"
                  );
                }
              }
            }
          }
        )
        .setTitle(
          mode === "attach"
            ? "Select files from Google Drive"
            : "Import from Google Drive"
        )
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

  // Allow custom render or default to button
  if (props.children) {
    return <>{props.children({ onClick: handleImport, loading })}</>;
  }

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
