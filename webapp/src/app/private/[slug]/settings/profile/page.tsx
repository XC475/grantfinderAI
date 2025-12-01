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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Building2,
  MapPin,
  Mail,
  Upload,
  Image as ImageIcon,
  Info,
  Save,
  GraduationCap,
  Plus,
  Trash2,
  ChevronDown,
  Globe,
  DollarSign,
  Target,
  FileText,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomFieldsManager } from "@/components/organization/CustomFieldsManager";

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

export default function ProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Mission Statement state
  const [showMissionStatement, setShowMissionStatement] = useState(false);

  // Budget state
  const [budgetDisplayValue, setBudgetDisplayValue] = useState("");
  const [fiscalYearEndDate, setFiscalYearEndDate] = useState<Date | undefined>(
    undefined
  );

  // Strategic Plan state
  const [strategicPlanState, setStrategicPlanState] = useState<
    "empty" | "loading" | "success"
  >("empty");
  const [strategicPlanUploadDate, setStrategicPlanUploadDate] =
    useState<Date | null>(null);
  const [strategicPlanFileName, setStrategicPlanFileName] = useState<
    string | null
  >(null);
  const [showStrategicPlanModal, setShowStrategicPlanModal] = useState(false);

  // Track active tab to conditionally show Save Changes button
  const [activeTab, setActiveTab] = useState("basic-info");

  useEffect(() => {
    fetchOrganization();
  }, [slug]);

  // Initialize mission statement visibility
  useEffect(() => {
    if (organization) {
      setShowMissionStatement(!!organization.missionStatement);
    }
  }, [organization]);

  // Initialize budget display value
  useEffect(() => {
    if (organization?.annualOperatingBudget) {
      setBudgetDisplayValue(formatCurrency(organization.annualOperatingBudget));
    } else {
      setBudgetDisplayValue("");
    }
  }, [organization?.annualOperatingBudget]);

  // Initialize fiscal year end date
  useEffect(() => {
    if (organization?.fiscalYearEnd) {
      const parsed = parseFiscalYearEnd(organization.fiscalYearEnd);
      setFiscalYearEndDate(parsed);
    }
  }, [organization?.fiscalYearEnd]);

  // Initialize strategic plan state
  useEffect(() => {
    if (organization?.strategicPlan && organization.strategicPlan.length > 0) {
      setStrategicPlanState("success");
      // If there's existing content, use updatedAt as upload date fallback
      setStrategicPlanUploadDate(new Date(organization.updatedAt));
    } else {
      setStrategicPlanState("empty");
      setStrategicPlanUploadDate(null);
    }
  }, [organization?.strategicPlan, organization?.updatedAt]);

  // Helper functions for currency formatting
  const formatCurrency = (value: string | null): string => {
    if (!value) return "";
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const parseCurrency = (value: string): string => {
    return value.replace(/[^0-9.]/g, "");
  };

  // Helper function to parse fiscal year end string to Date
  const parseFiscalYearEnd = (value: string): Date | undefined => {
    if (!value) return undefined;

    // Try different formats
    const formats = ["MM/dd", "M/d", "MMMM d", "MMMM dd"];
    const currentYear = new Date().getFullYear();

    for (const fmt of formats) {
      try {
        const parsed = parse(value, fmt, new Date(currentYear, 0, 1));
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      } catch {
        // Try next format
      }
    }

    return undefined;
  };

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

    // Store filename for display
    const fileName = file.name;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word (.docx) file");
      return;
    }

    // Validate file size (max 40MB)
    if (file.size > 40 * 1024 * 1024) {
      toast.error("File size must be less than 40MB");
      return;
    }

    setUploadingPdf(true);
    setStrategicPlanState("loading");

    try {
      // Step 1: Extract text from PDF or DOCX
      const formData = new FormData();
      formData.append("file", file);

      const extractResponse = await fetch("/api/pdf-extract", {
        method: "POST",
        body: formData,
      });

      if (!extractResponse.ok) {
        const error = await extractResponse.json();
        throw new Error(error.error || "Failed to extract text from file");
      }

      const extractData = await extractResponse.json();
      const extractedText = extractData.text;

      // Step 2: Automatically summarize with AI
      let finalText = extractedText;

      if (extractedText && extractedText.length >= 100) {
        try {
          const summarizeResponse = await fetch(
            "/api/strategic-plan-summarize",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                strategicPlanText: extractedText,
              }),
            }
          );

          if (summarizeResponse.ok) {
            const summarizeData = await summarizeResponse.json();
            finalText = summarizeData.summary;
          } else {
            // If summarization fails, use extracted text
            console.warn("AI summarization failed, using extracted text");
          }
        } catch (summarizeError) {
          console.warn("Error during AI summarization:", summarizeError);
          // Continue with extracted text if AI fails
        }
      }

      // Step 3: Save to database
      const updateResponse = await fetch(
        `/api/organizations/${organization.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategicPlan: finalText }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to save strategic plan to database");
      }

      // Update the strategic plan field
      setOrganization({
        ...organization,
        strategicPlan: finalText,
      });

      // Set success state
      setStrategicPlanState("success");
      setStrategicPlanUploadDate(new Date());
      setStrategicPlanFileName(fileName);

      toast.success(
        `Strategic plan uploaded and summarized successfully from ${extractData.pageCount} page${extractData.pageCount > 1 ? "s" : ""}`
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setStrategicPlanState("empty");
      toast.error(
        error instanceof Error ? error.message : "Failed to process PDF"
      );
    } finally {
      setUploadingPdf(false);
      // Reset the file input
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      // Prepare organization data with formatted fiscal year end
      const dataToSave = {
        ...organization,
        fiscalYearEnd: fiscalYearEndDate
          ? format(fiscalYearEndDate, "MM/dd")
          : organization.fiscalYearEnd,
      };

      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
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

  // Handle delete strategic plan
  const handleDeleteStrategicPlan = async () => {
    if (!organization) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete the strategic plan? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicPlan: null }),
      });

      if (!response.ok) throw new Error("Failed to delete strategic plan");

      // Update local state
      setOrganization({ ...organization, strategicPlan: null });
      setStrategicPlanState("empty");
      setStrategicPlanUploadDate(null);
      setStrategicPlanFileName(null);
      toast.success("Strategic plan deleted successfully");
    } catch (error) {
      console.error("Error deleting strategic plan:", error);
      toast.error("Failed to delete strategic plan");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s information and settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="space-y-8">
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Logo</h3>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo">Upload your organization&apos;s logo</Label>
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
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Details</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={organization.name}
                  onChange={(e) =>
                    setOrganization({ ...organization, name: e.target.value })
                  }
                  placeholder="Enter your organization's full name"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-auto min-h-10 py-2"
                    >
                      <div className="flex flex-wrap gap-1 flex-1">
                        {organization.services &&
                        organization.services.length > 0 ? (
                          organization.services.map((serviceValue) => {
                            const service = SERVICES_OPTIONS.find(
                              (s) => s.value === serviceValue
                            );
                            return service ? (
                              <Badge
                                key={serviceValue}
                                variant="secondary"
                                className="mr-1"
                              >
                                {service.label}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-muted-foreground">
                            Select organization types...
                          </span>
                        )}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" sideOffset={4}>
                    <div className="p-2">
                      <div className="space-y-1">
                        {SERVICES_OPTIONS.map((service) => {
                          const isChecked =
                            organization.services?.includes(service.value) ||
                            false;
                          return (
                            <div
                              key={service.value}
                              className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                              onClick={() => {
                                const currentServices =
                                  organization.services || [];
                                let newServices: string[];
                                if (isChecked) {
                                  // Remove service
                                  newServices = currentServices.filter(
                                    (s) => s !== service.value
                                  );
                                } else {
                                  // Add service if not already present
                                  if (
                                    !currentServices.includes(service.value)
                                  ) {
                                    newServices = [
                                      ...currentServices,
                                      service.value,
                                    ];
                                  } else {
                                    newServices = currentServices;
                                  }
                                }
                                setOrganization({
                                  ...organization,
                                  services: newServices,
                                });
                              }}
                            >
                              <Checkbox
                                id={`service-${service.value}`}
                                checked={isChecked}
                                onCheckedChange={() => {
                                  // Handled by parent onClick
                                }}
                              />
                              <Label
                                htmlFor={`service-${service.value}`}
                                className="text-sm font-normal cursor-pointer flex-1"
                              >
                                {service.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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

          {/* Primary Office Address */}
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

          {/* Website */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Website</h3>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Organization Website</Label>
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
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-8">
          {/* Strategic Plan - Most Important, First */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Strategic Plan</h3>
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

            {/* Empty State */}
            {strategicPlanState === "empty" && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">
                  Upload your document
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your strategic plan document (PDF or Word) to get
                  started
                </p>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploadingPdf}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
            )}

            {/* Loading State */}
            {strategicPlanState === "loading" && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h4 className="text-lg font-semibold mb-2">
                  Processing document...
                </h4>
                <p className="text-sm text-muted-foreground">
                  Extracting and summarizing your document with AI
                </p>
              </div>
            )}

            {/* Success State */}
            {strategicPlanState === "success" && (
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="relative">
                      <FileText className="h-12 w-12 text-primary" />
                      <CheckCircle2 className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-1">
                      Strategic plan uploaded successfully
                    </h4>
                    {strategicPlanFileName && (
                      <p className="text-sm font-medium text-foreground mb-1">
                        {strategicPlanFileName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-4">
                      {strategicPlanUploadDate && (
                        <>
                          Uploaded and summarized on{" "}
                          {format(strategicPlanUploadDate, "PPP")}
                        </>
                      )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStrategicPlanModal(true)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View summarized plan
                      </Button>
                      <input
                        type="file"
                        accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handlePdfUpload}
                        className="hidden"
                        id="replace-pdf-input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "replace-pdf-input"
                          ) as HTMLInputElement;
                          input?.click();
                        }}
                        disabled={uploadingPdf}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Replace Document
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteStrategicPlan}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mission Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Mission Statement</h3>
            </div>
            <div className="grid gap-4">
              {!showMissionStatement && !organization.missionStatement ? (
                <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg">
                  <Button
                    variant="outline"
                    onClick={() => setShowMissionStatement(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mission Statement
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="missionStatement">
                    Your organization&apos;s mission statement
                  </Label>
                  <Textarea
                    id="missionStatement"
                    value={organization.missionStatement || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setOrganization({
                        ...organization,
                        missionStatement: e.target.value,
                      })
                    }
                    rows={6}
                    placeholder="Enter your organization's mission statement..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe your organization&apos;s purpose, values, and goals
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Basic Budget Information</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="annualOperatingBudget">
                    Annual Operating Budget
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="annualOperatingBudget"
                      type="text"
                      value={budgetDisplayValue}
                      onChange={(e) => {
                        setBudgetDisplayValue(e.target.value);
                        const parsed = parseCurrency(e.target.value);
                        setOrganization({
                          ...organization,
                          annualOperatingBudget: parsed,
                        });
                      }}
                      onBlur={() => {
                        if (organization.annualOperatingBudget) {
                          setBudgetDisplayValue(
                            formatCurrency(organization.annualOperatingBudget)
                          );
                        }
                      }}
                      placeholder="1,000,000"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fiscalYearEndDate ? (
                          format(fiscalYearEndDate, "MM/dd")
                        ) : (
                          <span className="text-muted-foreground">
                            Select date
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fiscalYearEndDate}
                        onSelect={(date) => {
                          setFiscalYearEndDate(date);
                          if (date) {
                            setOrganization({
                              ...organization,
                              fiscalYearEnd: format(date, "MM/dd"),
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
        </TabsContent>

        <TabsContent value="custom-fields" className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Custom Fields</h3>
              </div>
              <Button
                onClick={() => {
                  const event = new CustomEvent("open-add-custom-field-dialog");
                  window.dispatchEvent(event);
                }}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Add custom metadata fields to your organization profile. These
                fields will be included in AI prompts to provide additional
                context about your organization.
              </p>
            </div>
            <CustomFieldsManager />
          </div>
        </TabsContent>
      </Tabs>

      {/* Strategic Plan Modal */}
      <Dialog
        open={showStrategicPlanModal}
        onOpenChange={setShowStrategicPlanModal}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Strategic Plan</DialogTitle>
            <DialogDescription>
              Review and edit your AI-summarized strategic plan. This summary
              was automatically generated from your uploaded document.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] py-4">
            <Textarea
              value={organization?.strategicPlan || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                organization &&
                setOrganization({
                  ...organization,
                  strategicPlan: e.target.value,
                })
              }
              rows={20}
              className="font-mono text-sm min-h-[400px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStrategicPlanModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave();
                setShowStrategicPlanModal(false);
                toast.success("Strategic plan updated successfully");
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
