"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Building2,
  MapPin,
  Mail,
  Upload,
  Image as ImageIcon,
  Info,
  Save,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  organizationLogo: string | null;
  website: string | null;
  missionStatement: string | null;
  strategicPlan: string | null;
  annualOperatingBudget: string | null;
  fiscalYearEnd: string | null;
  phone: string | null;
  email: string | null;
  organizationLeaderName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchOrganization();
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations`);
      if (!response.ok) throw new Error("Failed to fetch organization");

      const data = await response.json();
      setOrganization(data);
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("Failed to load organization profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${organization.id}-${Date.now()}.${fileExt}`;
      const filePath = `organization-logos/${fileName}`;

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from("grantware")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("grant ware").getPublicUrl(filePath);

      // Update organization with logo URL
      setOrganization({ ...organization, organizationLogo: publicUrl });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(organization),
      });

      if (!response.ok) throw new Error("Failed to update organization");

      toast.success("Organization profile updated successfully");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              Unable to load organization profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s information and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Manage your organization&apos;s information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>
            <div className="grid gap-4">
              {/* Organization Logo */}
              <div className="grid gap-2">
                <Label htmlFor="logo">Organization Logo</Label>
                <div className="flex items-center gap-4">
                  {organization.organizationLogo ? (
                    <div className="relative w-24 h-24 rounded-lg border-2 border-border overflow-hidden">
                      <Image
                        src={organization.organizationLogo}
                        alt="Organization logo"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={organization.name}
                  onChange={(e) =>
                    setOrganization({ ...organization, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={organization.website || ""}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      website: e.target.value,
                    })
                  }
                  placeholder="https://organization.org"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="missionStatement">Mission Statement</Label>
                <Textarea
                  id="missionStatement"
                  value={organization.missionStatement || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setOrganization({
                      ...organization,
                      missionStatement: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Your organization's mission statement..."
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="strategicPlan">Strategic Plan</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">
                          Examples of strategic plan documents:
                        </p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Multi-year strategic plan</li>
                          <li>School improvement plan</li>
                          <li>District strategic roadmap</li>
                          <li>Long-term goals and objectives</li>
                          <li>Vision and priorities document</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="strategicPlan"
                  value={organization.strategicPlan || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setOrganization({
                      ...organization,
                      strategicPlan: e.target.value,
                    })
                  }
                  rows={6}
                  placeholder="Paste your organization's strategic plan document here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="annualOperatingBudget">
                    Annual Operating Budget
                  </Label>
                  <Input
                    id="annualOperatingBudget"
                    type="number"
                    value={organization.annualOperatingBudget || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        annualOperatingBudget: e.target.value,
                      })
                    }
                    placeholder="1000000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    type="text"
                    value={organization.fiscalYearEnd || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        fiscalYearEnd: e.target.value,
                      })
                    }
                    placeholder="June 30 or 06/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Contact Information</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="organizationLeaderName">
                  Organization Leader Name
                </Label>
                <Input
                  id="organizationLeaderName"
                  value={organization.organizationLeaderName || ""}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      organizationLeaderName: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={organization.email || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        email: e.target.value,
                      })
                    }
                    placeholder="contact@organization.org"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={organization.phone || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Primary Office Address</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={organization.address || ""}
                  onChange={(e) =>
                    setOrganization({
                      ...organization,
                      address: e.target.value,
                    })
                  }
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={organization.city || ""}
                    onChange={(e) =>
                      setOrganization({ ...organization, city: e.target.value })
                    }
                    placeholder="Boston"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={organization.state || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        state: e.target.value,
                      })
                    }
                    placeholder="MA"
                    maxLength={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={organization.zipCode || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        zipCode: e.target.value,
                      })
                    }
                    placeholder="02101"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
