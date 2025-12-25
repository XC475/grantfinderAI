"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Target,
  CheckCircle2,
  Loader2,
  Upload,
  FileText,
  Info,
  Trash2,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
import { GoogleDriveConnection } from "@/components/integrations/GoogleDriveConnection";
import { createCheckoutSession } from "@/actions/stripe";
import { AddressAutocomplete } from "@/components/organization/AddressAutocomplete";

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
  missionStatement: string | null;
  organizationPlan: string | null;
  annualOperatingBudget: string | null;
  fiscalYearEnd: string | null;
  organizationLeaderName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  website: string | null;
  slug: string;
  services: string[] | null;
  updatedAt?: string;
}

interface OnboardingFlowProps {
  organizationSlug: string;
  organization: Organization | null;
  loading: boolean;
  saving: boolean;
  initialFormData: Partial<Organization>;
  onSaveAndContinue: (formData: Partial<Organization>) => Promise<void>;
  onComplete: () => Promise<void>;
  onSkip: () => Promise<void>;
}

const steps = [
  { id: 1, title: "Introduction" },
  { id: 2, title: "Leader Information" },
  { id: 3, title: "Profile Setup" },
  { id: 4, title: "Financial Information" },
  { id: 5, title: "Organization Documents" },
  { id: 6, title: "Payment Plan" },
];

export default function OnboardingFlow({
  organizationSlug,
  organization,
  loading,
  saving,
  initialFormData,
  onSaveAndContinue,
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<Partial<Organization>>(initialFormData);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Organization Plan state
  const [organizationPlanState, setOrganizationPlanState] = useState<
    "empty" | "loading" | "success"
  >("empty");
  const [organizationPlanUploadDate, setOrganizationPlanUploadDate] =
    useState<Date | null>(null);
  const [organizationPlanFileName, setOrganizationPlanFileName] = useState<
    string | null
  >(null);
  const [showOrganizationPlanModal, setShowOrganizationPlanModal] =
    useState(false);

  // Budget state
  const [budgetDisplayValue, setBudgetDisplayValue] = useState("");
  const [fiscalYearEndDate, setFiscalYearEndDate] = useState<Date | undefined>(
    undefined
  );

  // Payment plan selection (local state only)
  const [selectedPlan, setSelectedPlan] = useState<"base" | "business" | null>(
    null
  );
  const [processingPayment, setProcessingPayment] = useState(false);

  // Google Drive connection state
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);

  // Track initial form data to detect changes
  const initialFormDataRef = useRef<Partial<Organization>>(initialFormData);

  // Check if form data has changed from initial
  const hasFormDataChanged = useMemo(() => {
    const current = formData;
    const initial = initialFormDataRef.current;

    // Compare all fields
    const fieldsToCheck: (keyof Organization)[] = [
      "name",
      "missionStatement",
      "organizationPlan",
      "annualOperatingBudget",
      "fiscalYearEnd",
      "organizationLeaderName",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
      "website",
      "services",
    ];

    for (const field of fieldsToCheck) {
      const currentValue = current[field];
      const initialValue = initial[field];

      // Handle arrays (services)
      if (field === "services") {
        const currentArr = (currentValue as string[]) || [];
        const initialArr = (initialValue as string[]) || [];
        if (
          currentArr.length !== initialArr.length ||
          !currentArr.every((val) => initialArr.includes(val))
        ) {
          return true;
        }
      } else {
        // Handle strings and null values
        const currentStr = currentValue?.toString().trim() || "";
        const initialStr = initialValue?.toString().trim() || "";
        if (currentStr !== initialStr) {
          return true;
        }
      }
    }

    return false;
  }, [formData]);

  useEffect(() => {
    setFormData(initialFormData);
    initialFormDataRef.current = initialFormData;

    // Initialize organization plan state
    if (
      organization?.organizationPlan &&
      organization.organizationPlan.length > 0
    ) {
      setOrganizationPlanState("success");
      // If there's existing content, use updatedAt as upload date fallback
      setOrganizationPlanUploadDate(
        new Date(organization.updatedAt || Date.now())
      );
    } else {
      setOrganizationPlanState("empty");
      setOrganizationPlanUploadDate(null);
      setOrganizationPlanFileName(null);
    }

    // Initialize budget display value
    if (organization?.annualOperatingBudget) {
      setBudgetDisplayValue(
        formatCurrency(organization.annualOperatingBudget.toString())
      );
    } else {
      setBudgetDisplayValue("");
    }

    // Initialize fiscal year end date
    if (organization?.fiscalYearEnd) {
      const parsed = parseFiscalYearEnd(organization.fiscalYearEnd);
      setFiscalYearEndDate(parsed);
    }
  }, [
    initialFormData,
    organization?.organizationPlan,
    organization?.updatedAt,
    organization?.annualOperatingBudget,
    organization?.fiscalYearEnd,
  ]);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      // Save data for current step before proceeding (except step 1)
      // Only save if data has actually changed
      if (currentStep > 1 && hasFormDataChanged) {
        try {
          await onSaveAndContinue(formData);
          // Update initial ref after successful save
          initialFormDataRef.current = { ...formData };
        } catch (error) {
          console.error("Error saving data:", error);
          return; // Don't proceed if save fails
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlanSelection = async (planId: "base" | "business") => {
    if (!organization || processingPayment) return;

    setSelectedPlan(planId);
    setProcessingPayment(true);

    try {
      const checkoutUrl = await createCheckoutSession(
        planId,
        organization.id,
        organizationSlug
      );
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      );
      setProcessingPayment(false);
    }
  };

  const updateFormData = (
    field: keyof Organization,
    value: string | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Update all address fields in a single state update to avoid race conditions
  const updateAddressFields = (parsedAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: parsedAddress.address,
      city: parsedAddress.city,
      state: parsedAddress.state,
      zipCode: parsedAddress.zipCode,
    }));
  };

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

  const parseFiscalYearEnd = (value: string): Date | undefined => {
    if (!value) return undefined;
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

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !organization) return;

    const fileName = file.name;
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word (.docx) file");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      toast.error("File size must be less than 40MB");
      return;
    }

    setUploadingPdf(true);
    setOrganizationPlanState("loading");

    try {
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

      let finalText = extractedText;
      if (extractedText && extractedText.length >= 100) {
        try {
          const summarizeResponse = await fetch(
            "/api/organization-plan-summarize",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                organizationPlanText: extractedText,
              }),
            }
          );

          if (summarizeResponse.ok) {
            const summarizeData = await summarizeResponse.json();
            finalText = summarizeData.summary;
          } else {
            console.warn("AI summarization failed, using extracted text");
          }
        } catch (summarizeError) {
          console.warn("Error during AI summarization:", summarizeError);
        }
      }

      await onSaveAndContinue({ organizationPlan: finalText });
      setFormData((prev) => ({ ...prev, organizationPlan: finalText }));
      // Update initial ref after successful save
      initialFormDataRef.current = {
        ...initialFormDataRef.current,
        organizationPlan: finalText,
      };

      setOrganizationPlanState("success");
      setOrganizationPlanUploadDate(new Date());
      setOrganizationPlanFileName(fileName);

      toast.success(
        `Organization plan uploaded and summarized successfully from ${extractData.pageCount} page${
          extractData.pageCount > 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setOrganizationPlanState("empty");
      toast.error(
        error instanceof Error ? error.message : "Failed to process PDF"
      );
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    }
  };

  const handleGoogleDriveFileSelected = async (
    fileId: string,
    fileName: string,
    mimeType: string
  ) => {
    if (!organization) return;

    setOrganizationPlanState("loading");
    setUploadingPdf(true);

    try {
      // Download file from Google Drive
      const downloadResponse = await fetch("/api/google-drive/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          fileName,
          mimeType,
        }),
      });

      if (!downloadResponse.ok) {
        const errorData = await downloadResponse.json();
        throw new Error(
          errorData.error || "Failed to download file from Google Drive"
        );
      }

      const blob = await downloadResponse.blob();
      const file = new File([blob], fileName, { type: mimeType });

      // Process the file the same way as upload
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

      let finalText = extractedText;
      if (extractedText && extractedText.length >= 100) {
        try {
          const summarizeResponse = await fetch(
            "/api/organization-plan-summarize",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                organizationPlanText: extractedText,
              }),
            }
          );

          if (summarizeResponse.ok) {
            const summarizeData = await summarizeResponse.json();
            finalText = summarizeData.summary;
          } else {
            console.warn("AI summarization failed, using extracted text");
          }
        } catch (summarizeError) {
          console.warn("Error during AI summarization:", summarizeError);
        }
      }

      await onSaveAndContinue({ organizationPlan: finalText });
      setFormData((prev) => ({ ...prev, organizationPlan: finalText }));
      // Update initial ref after successful save
      initialFormDataRef.current = {
        ...initialFormDataRef.current,
        organizationPlan: finalText,
      };

      setOrganizationPlanState("success");
      setOrganizationPlanUploadDate(new Date());
      setOrganizationPlanFileName(fileName);

      toast.success(
        `Organization plan imported and summarized successfully from Google Drive (${extractData.pageCount} page${
          extractData.pageCount > 1 ? "s" : ""
        })`
      );
    } catch (error) {
      console.error("Error importing from Google Drive:", error);
      setOrganizationPlanState("empty");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import from Google Drive"
      );
    } finally {
      setUploadingPdf(false);
    }
  };

  // Handle delete organization plan
  const handleDeleteOrganizationPlan = async () => {
    if (!organization) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete the organization plan? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await onSaveAndContinue({ organizationPlan: null });
      setFormData((prev) => ({ ...prev, organizationPlan: null }));
      // Update initial ref after successful save
      initialFormDataRef.current = {
        ...initialFormDataRef.current,
        organizationPlan: null,
      };
      setOrganizationPlanState("empty");
      setOrganizationPlanUploadDate(null);
      setOrganizationPlanFileName(null);
      toast.success("Organization plan deleted successfully");
    } catch (error) {
      console.error("Error deleting organization plan:", error);
      toast.error("Failed to delete organization plan");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl mb-2">
                Welcome to Grantware AI
              </CardTitle>
              <CardDescription className="text-base">
                Your intelligent assistant for finding and managing grant
                opportunities
              </CardDescription>
            </CardHeader>

            <div className="bg-muted p-6 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Let&apos;s set up your organization profile
              </h4>
              <p className="text-sm text-muted-foreground">
                To provide the most relevant grant recommendations, we need to
                know a bit more about your organization. This will only take a
                few minutes.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Leader Information</CardTitle>
              <CardDescription>
                Tell us about the primary leader of your organization.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="organizationLeaderName">Full Name</Label>
                <Input
                  id="organizationLeaderName"
                  value={formData.organizationLeaderName || ""}
                  onChange={(e) =>
                    updateFormData("organizationLeaderName", e.target.value)
                  }
                  placeholder="Executive Director or CEO name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="contact@organization.org"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Organization Profile Setup</CardTitle>
              <CardDescription>
                Provide basic information about your organization.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Your organization name"
                  required
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
                        {formData.services && formData.services.length > 0 ? (
                          (formData.services as string[]).map(
                            (serviceValue) => {
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
                            }
                          )
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
                            (formData.services as string[])?.includes(
                              service.value
                            ) || false;
                          return (
                            <div
                              key={service.value}
                              className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                              onClick={() => {
                                const currentServices =
                                  (formData.services as string[]) || [];
                                let newServices: string[];
                                if (isChecked) {
                                  newServices = currentServices.filter(
                                    (s) => s !== service.value
                                  );
                                } else {
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
                                updateFormData("services", newServices);
                              }}
                            >
                              <input
                                type="checkbox"
                                id={`service-${service.value}`}
                                checked={isChecked}
                                readOnly
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
              <div className="grid gap-4">
                <AddressAutocomplete
                  value={{
                    address: formData.address || undefined,
                    city: formData.city || undefined,
                    state: formData.state || undefined,
                    zipCode: formData.zipCode || undefined,
                  }}
                  onChange={(parsedAddress) => {
                    updateAddressFields(parsedAddress);
                  }}
                  placeholder="Start typing your address..."
                  label="Address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => updateFormData("website", e.target.value)}
                  placeholder="https://yourorganization.org"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="missionStatement">
                  Mission Statement (Optional)
                </Label>
                <Textarea
                  id="missionStatement"
                  value={formData.missionStatement || ""}
                  onChange={(e) =>
                    updateFormData("missionStatement", e.target.value)
                  }
                  rows={3}
                  placeholder="Describe your organization's mission..."
                />
                <p className="text-xs text-muted-foreground">
                  This helps us match you with aligned grant opportunities
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                Provide basic financial details for your organization.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
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
                        updateFormData("annualOperatingBudget", parsed);
                      }}
                      onBlur={() => {
                        if (formData.annualOperatingBudget) {
                          setBudgetDisplayValue(
                            formatCurrency(
                              formData.annualOperatingBudget.toString()
                            )
                          );
                        }
                      }}
                      placeholder="1,000,000"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fiscalYearEnd">
                    Fiscal Year End (Optional)
                  </Label>
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
                            updateFormData(
                              "fiscalYearEnd",
                              format(date, "MM/dd")
                            );
                          } else {
                            updateFormData("fiscalYearEnd", null);
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
        );

      case 5:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Organization Documents</CardTitle>
              <CardDescription>
                Upload key documents to enhance AI assistance and grant
                matching.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {/* Google Drive Connection Section */}
              <div className="space-y-4">
                <GoogleDriveConnection
                  returnTo={`/private/${organizationSlug}/onboarding`}
                  onConnectionChange={setGoogleDriveConnected}
                />
              </div>

              {/* Organization Plan Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Organization Plan</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">
                          Examples of organization plan documents:
                        </p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Strategic Plan</li>
                          <li>Annual Report</li>
                          <li>Multi-year plan</li>
                          <li>School improvement plan</li>
                          <li>District strategic roadmap</li>
                          <li>Long-term goals and objectives</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {organizationPlanState === "empty" && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold mb-2">
                      Upload your document
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your organization plan document (PDF or Word) to
                      get started
                    </p>
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={uploadingPdf}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                      {googleDriveConnected && (
                        <GoogleDriveImportPicker
                          mode="import"
                          onFileSelected={handleGoogleDriveFileSelected}
                          asButton
                        >
                          {({ onClick, loading: driveLoading }) => (
                            <Button
                              type="button"
                              onClick={onClick}
                              disabled={uploadingPdf || driveLoading}
                              variant="outline"
                            >
                              {driveLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Image
                                  src="/logos/google-drive.svg"
                                  alt="Google Drive"
                                  width={16}
                                  height={16}
                                  className="mr-2"
                                />
                              )}
                              Google Drive
                            </Button>
                          )}
                        </GoogleDriveImportPicker>
                      )}
                    </div>
                  </div>
                )}

                {organizationPlanState === "loading" && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                    <h4 className="text-lg font-semibold mb-2">
                      Processing document...
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Extracting and summarizing your document with AI
                    </p>
                  </div>
                )}

                {organizationPlanState === "success" && (
                  <div className="border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="relative">
                          <FileText className="h-12 w-12 text-purple-600" />
                          <CheckCircle2 className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">
                          Organization plan uploaded successfully
                        </h4>
                        {organizationPlanFileName && (
                          <p className="text-sm font-medium text-foreground mb-1">
                            {organizationPlanFileName}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-4">
                          {organizationPlanUploadDate && (
                            <>
                              Uploaded and summarized on{" "}
                              {format(organizationPlanUploadDate, "PPP")}
                            </>
                          )}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowOrganizationPlanModal(true)}
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
                            onClick={handleDeleteOrganizationPlan}
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
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Choose Your Payment Plan</CardTitle>
              <CardDescription>
                Select the plan that best fits your organization's needs.
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPlan === "base"
                    ? "border-purple-500 ring-2 ring-purple-500"
                    : "border-gray-200 hover:shadow-md",
                  processingPayment && "opacity-50 cursor-not-allowed"
                )}
                onClick={() =>
                  !processingPayment && handlePlanSelection("base")
                }
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Base Plan</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Essential features for small organizations.
                  </p>
                  <p className="text-2xl font-bold mb-4">$50/month</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Limited Grant Search
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Basic AI Assistant
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />5
                      Applications
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  selectedPlan === "business"
                    ? "border-purple-500 ring-2 ring-purple-500"
                    : "border-gray-200 hover:shadow-md",
                  processingPayment && "opacity-50 cursor-not-allowed"
                )}
                onClick={() =>
                  !processingPayment && handlePlanSelection("business")
                }
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Business Plan</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Advanced features for growing organizations.
                  </p>
                  <p className="text-2xl font-bold mb-4">$100/month</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Unlimited Grant Search
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Advanced AI Assistant
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Unlimited Applications
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Google Drive Integration
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-muted-foreground">Loading onboarding...</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="pb-0">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative flex flex-1 flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300",
                    currentStep > step.id
                      ? "bg-purple-600 text-white"
                      : currentStep === step.id
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div
                  className={cn(
                    "mt-2 text-center text-sm leading-tight max-w-[90px] min-h-10 flex items-center justify-center",
                    currentStep >= step.id ? "text-gray-800" : "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
                {step.id < steps.length && (
                  <div
                    className={cn(
                      "absolute top-5 left-[calc(50%+20px)] h-0.5 w-[calc(100%-40px)] -translate-y-1/2 bg-gray-200 transition-colors duration-300",
                      currentStep > step.id && "bg-purple-400"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={saving || currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep === 1 && (
                <Button onClick={handleNext} disabled={saving}>
                  <span>Get Started</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {currentStep > 1 && currentStep < steps.length && (
                <Button
                  onClick={handleNext}
                  disabled={
                    saving ||
                    (currentStep === 3 && !formData.name) || // Require organization name for Profile Setup
                    (currentStep === 5 && organizationPlanState === "loading") // Disable if organization plan is still processing
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              {currentStep === steps.length && (
                <Button
                  onClick={onComplete}
                  disabled={saving}
                  size="lg"
                  className="px-8"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <span>Start Exploring</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Plan Modal */}
      <Dialog
        open={showOrganizationPlanModal}
        onOpenChange={setShowOrganizationPlanModal}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Organization Plan</DialogTitle>
            <DialogDescription>
              Review and edit your AI-summarized organization plan. This summary
              was automatically generated from your uploaded document.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] py-4">
            <Textarea
              value={formData.organizationPlan || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateFormData("organizationPlan", e.target.value)
              }
              rows={20}
              className="font-mono text-sm min-h-[400px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrganizationPlanModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Only save if the plan text actually changed
                const currentPlan = formData.organizationPlan || "";
                const initialPlan =
                  initialFormDataRef.current.organizationPlan || "";
                if (currentPlan.trim() !== initialPlan.trim()) {
                  await onSaveAndContinue({
                    organizationPlan: formData.organizationPlan,
                  });
                  // Update initial ref after successful save
                  initialFormDataRef.current = {
                    ...initialFormDataRef.current,
                    organizationPlan: formData.organizationPlan,
                  };
                  toast.success("Organization plan updated successfully");
                }
                setShowOrganizationPlanModal(false);
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
