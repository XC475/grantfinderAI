"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function GoogleDriveConnectButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/google-drive/status");
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setConnected(Boolean(data.connected));
          }
        }
      } catch (error) {
        console.error("Failed to load Google Drive status", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/google-drive/auth";
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking connection
      </Button>
    );
  }

  if (connected) {
    return (
      <Button variant="outline" disabled>
        Google Drive Connected
      </Button>
    );
  }

  return <Button onClick={handleConnect}>Connect Google Drive</Button>;
}

