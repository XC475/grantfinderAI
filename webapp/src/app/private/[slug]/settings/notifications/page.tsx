"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function NotificationsSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [grantAlerts, setGrantAlerts] = useState(true);
  const [chatMessages, setChatMessages] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleToggle = (value: boolean, name: string) => {
    toast.success(`${name} ${value ? "enabled" : "disabled"}`);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600">
          Manage how you receive notifications and updates
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">
                All Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for all activities
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                setEmailNotifications(checked);
                handleToggle(checked, "Email notifications");
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="grant-alerts">Grant Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new grants matching your criteria
              </p>
            </div>
            <Switch
              id="grant-alerts"
              checked={grantAlerts}
              onCheckedChange={(checked) => {
                setGrantAlerts(checked);
                handleToggle(checked, "Grant alerts");
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chat-messages">Chat Messages</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for AI chat responses
              </p>
            </div>
            <Switch
              id="chat-messages"
              checked={chatMessages}
              onCheckedChange={(checked) => {
                setChatMessages(checked);
                handleToggle(checked, "Chat message notifications");
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your activity
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={weeklyDigest}
              onCheckedChange={(checked) => {
                setWeeklyDigest(checked);
                handleToggle(checked, "Weekly digest");
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketing */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Communications</CardTitle>
          <CardDescription>
            Manage marketing and promotional emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive news, updates, and promotional offers
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={marketingEmails}
              onCheckedChange={(checked) => {
                setMarketingEmails(checked);
                handleToggle(checked, "Marketing emails");
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
