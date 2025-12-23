"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface GoogleDriveConnectionProps {
  returnTo?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export function GoogleDriveConnection({
  returnTo,
  onConnectionChange,
}: GoogleDriveConnectionProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const response = await fetch("/api/google-drive/status");
        if (response.ok) {
          const status = await response.json();
          const connected = status.connected || false;
          setGoogleDriveConnected(connected);
          onConnectionChange?.(connected);
        }
      } catch (error) {
        console.error("Error checking Google Drive status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkConnectionStatus();
  }, [onConnectionChange]);

  // Handle OAuth callback feedback
  useEffect(() => {
    const gdriveStatus = searchParams.get("gdrive");
    const reason = searchParams.get("reason");

    if (gdriveStatus === "success") {
      toast.success("Google Drive connected successfully!");
      setGoogleDriveConnected(true);
      onConnectionChange?.(true);
      // Clear the URL params
      window.history.replaceState({}, "", window.location.pathname);
    } else if (gdriveStatus === "error") {
      const errorMessage = reason
        ? `Failed to connect Google Drive: ${reason.replace(/-/g, " ")}`
        : "Failed to connect Google Drive";
      toast.error(errorMessage);
      // Clear the URL params
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, onConnectionChange]);

  const handleConnectGoogleDrive = () => {
    // Use provided returnTo or default to current pathname
    const redirectTo = returnTo || pathname;
    const encodedReturnTo = encodeURIComponent(redirectTo);
    window.location.href = `/api/google-drive/auth?returnTo=${encodedReturnTo}`;
  };

  const handleDisconnectGoogleDrive = async () => {
    setDisconnecting(true);

    try {
      const response = await fetch("/api/google-drive/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Google Drive");
      }

      setGoogleDriveConnected(false);
      onConnectionChange?.(false);
      toast.success("Google Drive disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting Google Drive:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to disconnect Google Drive"
      );
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg">
          <Image
            src="/logos/google-drive.svg"
            alt="Google Drive"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-6">
            <h4 className="font-medium">Google Drive</h4>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : googleDriveConnected ? (
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                <XCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {googleDriveConnected
              ? "Access your Google Drive files and documents"
              : "Connect to import files from Google Drive"}
          </p>
        </div>
      </div>
      <div>
        {googleDriveConnected ? (
          <Button
            variant="outline"
            onClick={handleDisconnectGoogleDrive}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </Button>
        ) : (
          <Button onClick={handleConnectGoogleDrive}>Connect</Button>
        )}
      </div>
    </div>
  );
}

