"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sparkles,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFieldModal } from "@/components/profile/CustomFieldModal";

// Grade level options with numeric values
const GRADE_OPTIONS = [
  { value: -2, label: "Pre-Kindergarten (Pre-K / PK)" },
  { value: -1, label: "Transitional Kindergarten (TK)" },
  { value: 0, label: "Kindergarten (K)" },
  { value: 1, label: "1st Grade" },
  { value: 2, label: "2nd Grade" },
  { value: 3, label: "3rd Grade" },
  { value: 4, label: "4th Grade" },
  { value: 5, label: "5th Grade" },
  { value: 6, label: "6th Grade" },
  { value: 7, label: "7th Grade" },
  { value: 8, label: "8th Grade" },
  { value: 9, label: "9th Grade (Freshman)" },
  { value: 10, label: "10th Grade (Sophomore)" },
  { value: 11, label: "11th Grade (Junior)" },
  { value: 12, label: "12th Grade (Senior)" },
];

// Services options matching Prisma enum
const SERVICES_OPTIONS = [
  { value: "k12_education", label: "K-12 Education" },
  { value: "higher_education", label: "Higher Education" },
  { value: "non_profit", label: "Non-Profit" },
  { value: "government_agencies", label: "Government Agencies" },
  { value: "other", label: "Other" },
];

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
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
  enrollment: number | null;
  numberOfSchools: number | null;
  lowestGrade: number | null;
  highestGrade: number | null;
  services: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomField {
  id: string;
  fieldName: string;
  fieldValue: string | null;
  organizationId: string;
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
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<CustomField | null>(null);

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
      // Delete old logo if it exists
      if (organization.logoUrl) {
        try {
          // Extract file path from URL
          const urlParts = organization.logoUrl.split("/grantware/");
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1];
            await supabase.storage.from("grantware").remove([oldFilePath]);
          }
        } catch (deleteError) {
          console.warn("Failed to delete old logo:", deleteError);
          // Continue with upload even if delete fails
        }
      }

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
      } = supabase.storage.from("grantware").getPublicUrl(filePath);

      // Update organization in database
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: publicUrl }),
      });

      if (!response.ok) throw new Error("Failed to save logo URL");

      // Update local state
      setOrganization({ ...organization, logoUrl: publicUrl });
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadingPdf(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload to PDF extraction API
      const response = await fetch("/api/pdf-extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extract text from PDF");
      }

      const data = await response.json();

      // Update the database with extracted text
      const updateResponse = await fetch(
        `/api/organizations/${organization.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategicPlan: data.text }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to save extracted text to database");
      }

      // Update the strategic plan field with extracted text
      setOrganization({
        ...organization,
        strategicPlan: data.text,
      });

      toast.success(
        `Text extracted successfully from ${data.pageCount} page${data.pageCount > 1 ? "s" : ""} and saved`
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to extract text from PDF"
      );
    } finally {
      setUploadingPdf(false);
      // Reset the file input
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const handleSummarizeWithAI = async () => {
    if (!organization || !organization.strategicPlan) {
      toast.error("Please add a strategic plan first");
      return;
    }

    if (organization.strategicPlan.length < 100) {
      toast.error("Strategic plan is too short to summarize");
      return;
    }

    setSummarizing(true);
    try {
      const response = await fetch("/api/strategic-plan-summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategicPlanText: organization.strategicPlan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to summarize strategic plan");
      }

      const data = await response.json();

      // Update the database with AI summary
      const updateResponse = await fetch(
        `/api/organizations/${organization.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategicPlan: data.summary }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to save summary to database");
      }

      // Update the strategic plan field with the AI summary
      setOrganization({
        ...organization,
        strategicPlan: data.summary,
      });

      toast.success("Strategic plan summarized successfully with AI and saved");
    } catch (error) {
      console.error("Error summarizing strategic plan:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to summarize strategic plan"
      );
    } finally {
      setSummarizing(false);
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

  // Fetch custom fields
  const fetchCustomFields = async () => {
    if (!organization) return;

    setLoadingCustomFields(true);
    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/custom-fields`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch custom fields");
      }

      const data = await response.json();
      setCustomFields(data);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast.error("Failed to load custom fields");
    } finally {
      setLoadingCustomFields(false);
    }
  };

  // Load custom fields when organization is loaded
  useEffect(() => {
    if (organization) {
      fetchCustomFields();
    }
  }, [organization?.id]);

  // Handle create/update custom field
  const handleSaveCustomField = async (
    fieldName: string,
    fieldValue: string
  ) => {
    if (!organization) return;

    try {
      if (selectedField) {
        // Update existing field
        const response = await fetch(
          `/api/organizations/${organization.id}/custom-fields/${selectedField.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fieldName, fieldValue }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update custom field");
        }

        const updatedField = await response.json();
        setCustomFields((prev) =>
          prev.map((field) =>
            field.id === selectedField.id ? updatedField : field
          )
        );
        toast.success("Custom field updated successfully");
      } else {
        // Create new field
        const response = await fetch(
          `/api/organizations/${organization.id}/custom-fields`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fieldName, fieldValue }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create custom field");
        }

        const newField = await response.json();
        setCustomFields((prev) => [...prev, newField]);
        toast.success("Custom field created successfully");
      }
    } catch (error) {
      console.error("Error saving custom field:", error);
      throw error;
    }
  };

  // Handle delete custom field
  const handleDeleteCustomField = async (field: CustomField) => {
    if (!organization) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the custom field "${field.fieldName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/custom-fields/${field.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete custom field");
      }

      setCustomFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success("Custom field deleted successfully");
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast.error("Failed to delete custom field");
    }
  };

  // Open modal for creating new field
  const handleAddField = () => {
    setSelectedField(null);
    setModalOpen(true);
  };

  // Open modal for editing existing field
  const handleEditField = (field: CustomField) => {
    setSelectedField(field);
    setModalOpen(true);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground">
            Unable to load organization profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Organization Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s information and settings
        </p>
      </div>

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="org-info">Org Info</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-8">
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
                  {organization.logoUrl ? (
                    <div className="relative w-24 h-24 rounded-lg border-2 border-border overflow-hidden">
                      <Image
                        src={organization.logoUrl}
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
                  <Label>Organization Type</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Select the types of services your organization
                          provides. This helps filter grants to show only
                          relevant opportunities.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3">
                  {SERVICES_OPTIONS.map((service) => {
                    const isChecked =
                      organization.services?.includes(service.value) || false;
                    return (
                      <div
                        key={service.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`service-${service.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const currentServices = organization.services || [];
                            let newServices: string[];
                            if (checked) {
                              // Add service if not already present
                              if (!currentServices.includes(service.value)) {
                                newServices = [
                                  ...currentServices,
                                  service.value,
                                ];
                              } else {
                                newServices = currentServices;
                              }
                            } else {
                              // Remove service
                              newServices = currentServices.filter(
                                (s) => s !== service.value
                              );
                            }
                            setOrganization({
                              ...organization,
                              services: newServices,
                            });
                          }}
                        />
                        <Label
                          htmlFor={`service-${service.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {service.label}
                        </Label>
                      </div>
                    );
                  })}
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
        </TabsContent>

        <TabsContent value="contact" className="space-y-8">
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
        </TabsContent>

        <TabsContent value="org-info" className="space-y-8">
          {/* Budget Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Budget Information</h3>
            </div>
            <div className="grid gap-4">
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
          {/* Strategic Plan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Strategic Plan</h3>
            </div>
            <div className="grid gap-4">
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={uploadingPdf || summarizing}
                    >
                      {uploadingPdf ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting text...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload PDF
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSummarizeWithAI}
                      disabled={
                        summarizing ||
                        uploadingPdf ||
                        !organization?.strategicPlan ||
                        organization.strategicPlan.length < 100
                      }
                    >
                      {summarizing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Summarize with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF to extract text, or use AI to summarize and
                    extract grant-relevant information
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">School Information</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="enrollment">Total Enrollment</Label>
                  <Input
                    id="enrollment"
                    type="number"
                    value={organization.enrollment || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        enrollment: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="e.g., 5000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total number of students enrolled
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="numberOfSchools">Number of Schools</Label>
                  <Input
                    id="numberOfSchools"
                    type="number"
                    value={organization.numberOfSchools || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        numberOfSchools: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="e.g., 12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total number of schools in your district
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lowestGrade">Lowest Grade</Label>
                  <Select
                    value={
                      organization.lowestGrade !== null &&
                      organization.lowestGrade !== undefined
                        ? organization.lowestGrade.toString()
                        : ""
                    }
                    onValueChange={(value) =>
                      setOrganization({
                        ...organization,
                        lowestGrade: value ? parseInt(value) : null,
                      })
                    }
                  >
                    <SelectTrigger id="lowestGrade">
                      <SelectValue placeholder="Select lowest grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem
                          key={grade.value}
                          value={grade.value.toString()}
                        >
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Lowest grade level your organization serves
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="highestGrade">Highest Grade</Label>
                  <Select
                    value={
                      organization.highestGrade !== null &&
                      organization.highestGrade !== undefined
                        ? organization.highestGrade.toString()
                        : ""
                    }
                    onValueChange={(value) =>
                      setOrganization({
                        ...organization,
                        highestGrade: value ? parseInt(value) : null,
                      })
                    }
                  >
                    <SelectTrigger id="highestGrade">
                      <SelectValue placeholder="Select highest grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem
                          key={grade.value}
                          value={grade.value.toString()}
                        >
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Highest grade level your organization serves
                  </p>
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
        </TabsContent>

        <TabsContent value="custom-fields" className="space-y-8">
          {/* Custom Fields Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Custom Fields</h3>
              <p className="text-sm text-muted-foreground">
                Add custom information fields specific to your organization
              </p>
            </div>
            <Button onClick={handleAddField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Field
            </Button>
          </div>

          {/* Custom Fields List */}
          {loadingCustomFields ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : customFields.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                No custom fields yet. Add your first custom field to get
                started.
              </p>
              <Button variant="outline" onClick={handleAddField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">
                        {field.fieldName}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {field.fieldValue ? (
                          field.fieldValue.length > 200 ? (
                            <>
                              {field.fieldValue.substring(0, 200)}...
                              <button
                                className="text-primary hover:underline ml-1"
                                onClick={() => handleEditField(field)}
                              >
                                Show more
                              </button>
                            </>
                          ) : (
                            field.fieldValue
                          )
                        ) : (
                          <span className="italic">No value set</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomField(field)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Custom Field Modal */}
      <CustomFieldModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        field={selectedField}
        onSave={handleSaveCustomField}
      />
    </div>
  );
}
