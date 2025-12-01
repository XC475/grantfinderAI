"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AISettingsPage() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">AI Capabilities</h1>
        <p className="text-gray-600">
          Configure AI assistant settings and capabilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            AI capabilities settings will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We&apos;re working on bringing you powerful AI customization options to
            enhance your grant writing experience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

