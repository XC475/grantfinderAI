"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle2, XCircle } from "lucide-react";

export default function AccountSettingsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);

  useEffect(() => {
    fetchUser();

    // Handle OAuth callback feedback
    const gdriveStatus = searchParams.get("gdrive");
    const reason = searchParams.get("reason");

    if (gdriveStatus === "success") {
      toast.success("Google Drive connected successfully!");
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
  }, [searchParams]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setFullName(user.user_metadata?.name || "");
        setEmail(user.email || "");

        // Fetch additional user data from our API
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setGoogleDriveConnected(userData.googleDriveConnected || false);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          name: fullName,
        },
      });

      if (error) throw error;

      toast.success("Profile updated successfully");
      fetchUser(); // Refresh user data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogleDrive = () => {
    // Redirect to Google OAuth flow with current pathname
    const returnTo = encodeURIComponent(pathname);
    window.location.href = `/api/google-drive/auth?returnTo=${returnTo}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-gray-600">
          Manage your personal information and security
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <Button type="submit" disabled={saving || !newPassword}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Manage your connected third-party services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Google Drive Integration */}
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
                    {googleDriveConnected ? (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
