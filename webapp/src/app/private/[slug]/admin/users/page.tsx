"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Search, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  system_admin: boolean;
  createdAt: string;
  lastActiveAt: string;
  organization?: {
    slug: string;
    name: string;
    leaId: string | null;
    state: string | null;
    city: string | null;
    enrollment: number | null;
    countyName: string | null;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  leaId: string | null;
  state: string | null;
  city: string | null;
  createdAt: string;
  _count: {
    users: number;
  };
}

interface DistrictData {
  leaId: string;
  name: string;
  state: string;
  city: string | null;
  enrollment: number | null;
  countyName: string | null;
  stateLeaId?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  numberOfSchools?: number | null;
  lowestGrade?: number | null;
  highestGrade?: number | null;
  urbanCentricLocale?: number | null;
  districtDataYear?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Role selection dialog
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("MEMBER");

  // Mode selection: 'add_to_existing' or 'create_new'
  const [mode, setMode] = useState<"add_to_existing" | "create_new">(
    "add_to_existing"
  );

  // Organization state (for add_to_existing mode)
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  // Organization type for create_new mode
  const [organizationType, setOrganizationType] = useState<
    "school_district" | "custom"
  >("school_district");

  // School districts state (for school_district org type)
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("");

  // Custom org state (for custom org type)
  const [customOrgData, setCustomOrgData] = useState({
    name: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Form state
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "MEMBER",
    systemAdmin: false,
    districtData: null as DistrictData | null,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch organizations when dialog opens and mode is add_to_existing
  useEffect(() => {
    if (isDialogOpen && mode === "add_to_existing") {
      fetchOrganizations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen, mode]);

  // Fetch districts when dialog opens or state filter changes
  useEffect(() => {
    if (
      isDialogOpen &&
      mode === "create_new" &&
      organizationType === "school_district" &&
      (selectedStateFilter || districtSearch.length > 2)
    ) {
      fetchDistricts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateFilter, isDialogOpen, mode, organizationType]);

  const checkAdminAccess = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Check system admin access
    const response = await fetch("/api/admin/users");
    if (response.status === 403) {
      toast.error("Access denied - System admin only");
      router.back();
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      const response = await fetch("/api/admin/organizations");

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true);
      const params = new URLSearchParams();
      if (selectedStateFilter) {
        params.append("state", selectedStateFilter);
      }
      if (districtSearch && districtSearch.length > 2) {
        params.append("search", districtSearch);
      }

      const response = await fetch(`/api/school-districts?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }

      const data = await response.json();
      setDistricts(data.data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to load school districts");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleSearchDistricts = (search: string) => {
    setDistrictSearch(search);
    if (search.length > 2) {
      // Debounce search
      const timer = setTimeout(() => {
        fetchDistricts();
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleSelectDistrict = (district: DistrictData) => {
    setNewUser({ ...newUser, districtData: district });
    setDistrictSearch(`${district.name}, ${district.state}`);
    setShowDistrictDropdown(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Build request body based on mode
      const requestBody: any = {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        mode,
        role: newUser.role,
        system_admin: newUser.systemAdmin,
      };

      if (mode === "add_to_existing") {
        if (!selectedOrganization) {
          throw new Error("Please select an organization");
        }
        requestBody.organizationId = selectedOrganization;
      } else if (mode === "create_new") {
        requestBody.organizationType = organizationType;

        if (organizationType === "school_district") {
          if (!newUser.districtData) {
            throw new Error("Please select a school district");
          }
          requestBody.districtData = newUser.districtData;
        } else if (organizationType === "custom") {
          if (!customOrgData.name) {
            throw new Error("Please enter an organization name");
          }
          requestBody.customOrgData = customOrgData;
        }
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      const successMessage = data.newOrganizationCreated
        ? `User and organization created successfully${data.emailSent ? " and welcome email sent" : ""}`
        : `User created successfully${data.emailSent ? " and welcome email sent" : ""}`;

      toast.success(successMessage);
      setIsDialogOpen(false);

      // Reset form
      setNewUser({
        email: "",
        name: "",
        password: "",
        role: "MEMBER",
        systemAdmin: false,
        districtData: null,
      });
      setSelectedOrganization("");
      setDistrictSearch("");
      setSelectedStateFilter("");
      setCustomOrgData({
        name: "",
        website: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to create user"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${userEmail}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to delete user"
      );
    }
  };

  const handleToggleRole = (
    userId: string,
    currentRole: string,
    isSystemAdmin: boolean
  ) => {
    setSelectedUserId(userId);
    // If user is a system admin, set role to SYSTEM_ADMIN, otherwise use their org role
    setSelectedRole(isSystemAdmin ? "SYSTEM_ADMIN" : currentRole);
    setIsRoleDialogOpen(true);
  };

  const handleConfirmRole = async () => {
    try {
      // If system admin is selected, set role to ADMIN and system_admin to true
      const isSystemAdmin = selectedRole === "SYSTEM_ADMIN";
      const requestBody: any = {
        role: isSystemAdmin ? "ADMIN" : selectedRole,
      };

      // Always set system_admin flag (true for system admin, false for others)
      requestBody.system_admin = isSystemAdmin;

      const response = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      toast.success(
        isSystemAdmin
          ? "User granted System Admin access"
          : "User role updated successfully"
      );
      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to update user role"
      );
    }
  };

  const selectedDistrict = newUser.districtData;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const US_STATES = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a user to an existing organization or create a new one
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-6 py-4">
                  {/* Mode Selection */}
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                      value={mode}
                      onValueChange={(
                        value: "add_to_existing" | "create_new"
                      ) => setMode(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add_to_existing">
                          Add User to Existing Organization
                        </SelectItem>
                        <SelectItem value="create_new">
                          Create New Organization
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add to Existing Organization Mode */}
                  {mode === "add_to_existing" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold">Select Organization</h3>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        {loadingOrganizations ? (
                          <div className="flex items-center gap-2 p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              Loading organizations...
                            </span>
                          </div>
                        ) : (
                          <Select
                            value={selectedOrganization}
                            onValueChange={setSelectedOrganization}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an organization..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name} ({org._count.users}{" "}
                                  {org._count.users === 1 ? "user" : "users"})
                                  {org.leaId && ` • ${org.state}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Create New Organization Mode */}
                  {mode === "create_new" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h3 className="font-semibold">Create Organization</h3>
                      <div className="space-y-2">
                        <Label>Organization Type</Label>
                        <Select
                          value={organizationType}
                          onValueChange={(
                            value: "school_district" | "custom"
                          ) => setOrganizationType(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="school_district">
                              School District
                            </SelectItem>
                            <SelectItem value="custom">
                              Custom Organization
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* School District Organization Form */}
                      {organizationType === "school_district" && (
                        <div className="space-y-2">
                          <Label htmlFor="district">School District</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Filter by state first, then search for the district
                          </p>

                          {/* State Filter */}
                          <Select
                            value={selectedStateFilter}
                            onValueChange={setSelectedStateFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a state..." />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* District Search */}
                          {selectedStateFilter && (
                            <div className="relative">
                              <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="district"
                                  placeholder="Search for school district..."
                                  value={districtSearch}
                                  onChange={(e) =>
                                    handleSearchDistricts(e.target.value)
                                  }
                                  onFocus={() => setShowDistrictDropdown(true)}
                                  className="pl-9"
                                />
                              </div>

                              {/* District Dropdown */}
                              {showDistrictDropdown &&
                                districtSearch.length > 2 &&
                                !selectedDistrict && (
                                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {loadingDistricts ? (
                                      <div className="p-4 text-center">
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                      </div>
                                    ) : districts.length > 0 ? (
                                      <div className="py-1">
                                        {districts.map((district) => (
                                          <button
                                            key={district.leaId}
                                            type="button"
                                            className="w-full px-4 py-2 text-left hover:bg-accent text-sm"
                                            onClick={() =>
                                              handleSelectDistrict(district)
                                            }
                                          >
                                            <div className="font-medium">
                                              {district.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {district.city}, {district.state}
                                              {district.enrollment &&
                                                ` • ${district.enrollment.toLocaleString()} students`}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="p-4 text-center text-sm text-muted-foreground">
                                        No districts found. Try a different
                                        search.
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* Selected District Display */}
                              {selectedDistrict && (
                                <div className="mt-2 p-3 bg-accent rounded-md">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">
                                        {selectedDistrict.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedDistrict.city},{" "}
                                        {selectedDistrict.state}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setNewUser({
                                          ...newUser,
                                          districtData: null,
                                        });
                                        setDistrictSearch("");
                                      }}
                                    >
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Custom Organization Form */}
                      {organizationType === "custom" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name *</Label>
                            <Input
                              id="orgName"
                              value={customOrgData.name}
                              onChange={(e) =>
                                setCustomOrgData({
                                  ...customOrgData,
                                  name: e.target.value,
                                })
                              }
                              required={
                                mode === "create_new" &&
                                organizationType === "custom"
                              }
                              placeholder="Enter organization name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="orgWebsite">Website</Label>
                              <Input
                                id="orgWebsite"
                                type="url"
                                value={customOrgData.website}
                                onChange={(e) =>
                                  setCustomOrgData({
                                    ...customOrgData,
                                    website: e.target.value,
                                  })
                                }
                                placeholder="https://example.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="orgEmail">Email</Label>
                              <Input
                                id="orgEmail"
                                type="email"
                                value={customOrgData.email}
                                onChange={(e) =>
                                  setCustomOrgData({
                                    ...customOrgData,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="contact@example.com"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="orgPhone">Phone</Label>
                              <Input
                                id="orgPhone"
                                type="tel"
                                value={customOrgData.phone}
                                onChange={(e) =>
                                  setCustomOrgData({
                                    ...customOrgData,
                                    phone: e.target.value,
                                  })
                                }
                                placeholder="(123) 456-7890"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="orgCity">City</Label>
                              <Input
                                id="orgCity"
                                value={customOrgData.city}
                                onChange={(e) =>
                                  setCustomOrgData({
                                    ...customOrgData,
                                    city: e.target.value,
                                  })
                                }
                                placeholder="City"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* User Details Section (always shown) */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold">User Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          required
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          required
                          minLength={6}
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Organization Role *</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => {
                            setNewUser({ ...newUser, role: value });
                            // Reset systemAdmin when changing role
                            if (value !== "ADMIN") {
                              setNewUser((prev) => ({
                                ...prev,
                                role: value,
                                systemAdmin: false,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="OWNER">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Note: Only one owner allowed per organization
                        </p>
                      </div>

                      {/* Admin Type Selection */}
                      {newUser.role === "ADMIN" && (
                        <div className="space-y-2 p-3 border rounded-md bg-muted/50">
                          <Label>Admin Type *</Label>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-3">
                              <input
                                type="radio"
                                id="org-admin"
                                name="admin-type"
                                checked={!newUser.systemAdmin}
                                onChange={() =>
                                  setNewUser({ ...newUser, systemAdmin: false })
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="org-admin"
                                  className="font-medium cursor-pointer"
                                >
                                  Organization Admin
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  Can manage users and settings within their
                                  organization only
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <input
                                type="radio"
                                id="system-admin"
                                name="admin-type"
                                checked={newUser.systemAdmin}
                                onChange={() =>
                                  setNewUser({ ...newUser, systemAdmin: true })
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="system-admin"
                                  className="font-medium cursor-pointer"
                                >
                                  System Admin
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  Full platform access - can manage all users
                                  and organizations
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Role</th>
                  <th className="p-4 text-left font-medium">District</th>
                  <th className="p-4 text-left font-medium">Created</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {user.system_admin && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            SYSTEM ADMIN
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleToggleRole(
                              user.id,
                              user.role,
                              user.system_admin
                            )
                          }
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors hover:opacity-80 ${
                            user.role === "OWNER"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          title="Click to change role"
                        >
                          {user.role}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {user.organization?.leaId ? (
                        <div>
                          <div className="font-medium">
                            {user.organization.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.organization.city}, {user.organization.state}
                            {user.organization.enrollment &&
                              ` • ${user.organization.enrollment.toLocaleString()} students`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select the organization role for this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div
                className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedRole("MEMBER")}
              >
                <input
                  type="radio"
                  id="role-member"
                  name="role-selection"
                  checked={selectedRole === "MEMBER"}
                  onChange={() => setSelectedRole("MEMBER")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="role-member"
                    className="font-medium cursor-pointer"
                  >
                    Member
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Standard user with basic access to organization resources
                  </p>
                </div>
              </div>
              <div
                className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedRole("ADMIN")}
              >
                <input
                  type="radio"
                  id="role-admin"
                  name="role-selection"
                  checked={selectedRole === "ADMIN"}
                  onChange={() => setSelectedRole("ADMIN")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="role-admin"
                    className="font-medium cursor-pointer"
                  >
                    Admin
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Can manage users and settings within their organization
                  </p>
                </div>
              </div>
              <div
                className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedRole("OWNER")}
              >
                <input
                  type="radio"
                  id="role-owner"
                  name="role-selection"
                  checked={selectedRole === "OWNER"}
                  onChange={() => setSelectedRole("OWNER")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="role-owner"
                    className="font-medium cursor-pointer"
                  >
                    Owner
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Full control over the organization (only one per
                    organization)
                  </p>
                </div>
              </div>

              {/* Separator */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-destructive/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-destructive font-semibold">
                    Danger Zone
                  </span>
                </div>
              </div>

              {/* System Admin Option with Warning */}
              <div
                className="flex items-start space-x-3 p-3 border-2 border-destructive/50 rounded-lg cursor-pointer hover:bg-destructive/5 transition-colors bg-destructive/5"
                onClick={() => setSelectedRole("SYSTEM_ADMIN")}
              >
                <input
                  type="radio"
                  id="role-system-admin"
                  name="role-selection"
                  checked={selectedRole === "SYSTEM_ADMIN"}
                  onChange={() => setSelectedRole("SYSTEM_ADMIN")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="role-system-admin"
                      className="font-medium cursor-pointer text-destructive"
                    >
                      System Admin
                    </label>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Full platform access - can manage ALL users and
                    organizations across the entire system
                  </p>
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive font-medium flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Warning: This grants unrestricted access to all platform
                      data and settings. Use with extreme caution.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRole}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
