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
import { Loader2, Plus, Trash2, Shield, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  system_admin: boolean;
  createdAt: string;
  lastActiveAt: string;
  organization?: {
    slug: string;
    role: string;
    schoolDistrict?: {
      id: string;
      leaId: string;
      name: string;
      stateCode: string;
      city: string | null;
      enrollment: number | null;
      countyName: string | null;
    };
  };
}

interface SchoolDistrict {
  leaId: string;
  name: string;
  stateCode: string;
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
  year?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // School districts state
  const [districts, setDistricts] = useState<SchoolDistrict[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>("");

  // Form state
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    organizationRole: "ADMIN",
    districtData: null as SchoolDistrict | null,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch districts when dialog opens or state filter changes
  useEffect(() => {
    if (isDialogOpen && (selectedStateFilter || districtSearch.length > 2)) {
      fetchDistricts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateFilter, isDialogOpen]);

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

  const handleSelectDistrict = (district: SchoolDistrict) => {
    setNewUser({ ...newUser, districtData: district });
    setDistrictSearch(`${district.name}, ${district.stateCode}`);
    setShowDistrictDropdown(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success(
        `User created successfully${data.emailSent ? " and welcome email sent" : ""}`
      );
      setIsDialogOpen(false);
      setNewUser({
        email: "",
        name: "",
        password: "",
        organizationRole: "ADMIN",
        districtData: null,
      });
      setDistrictSearch("");
      setSelectedStateFilter("");
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

  const handleToggleSystemAdmin = async (
    userId: string,
    currentSystemAdmin: boolean
  ) => {
    const newSystemAdmin = !currentSystemAdmin;

    if (
      !confirm(`${newSystemAdmin ? "Grant" : "Remove"} system admin access?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_admin: newSystemAdmin }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update system admin status");
      }

      toast.success("System admin status updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating system admin:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to update system admin status"
      );
    }
  };

  const handleToggleOrgRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";

    if (!confirm(`Change organization role to ${newRole}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationRole: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update organization role");
      }

      toast.success("Organization role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating organization role:", error);
      toast.error(
        (error instanceof Error ? error.message : String(error)) ||
          "Failed to update organization role"
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user account to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationRole">Organization Role</Label>
                    <Select
                      value={newUser.organizationRole}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, organizationRole: value })
                      }
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
                  </div>

                  {/* School District Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="district">School District (Optional)</Label>
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
                                        {district.city}, {district.stateCode}
                                        {district.enrollment &&
                                          ` • ${district.enrollment.toLocaleString()} students`}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No districts found. Try a different search.
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
                                  {selectedDistrict.stateCode}
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.organization?.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.organization?.role === "OWNER"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.organization?.role || "MEMBER"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {user.organization?.schoolDistrict ? (
                        <div>
                          <div className="font-medium">
                            {user.organization.schoolDistrict.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.organization.schoolDistrict.city},{" "}
                            {user.organization.schoolDistrict.stateCode}
                            {user.organization.schoolDistrict.enrollment &&
                              ` • ${user.organization.schoolDistrict.enrollment.toLocaleString()} students`}
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
                        onClick={() =>
                          handleToggleSystemAdmin(user.id, user.system_admin)
                        }
                        title={`${user.system_admin ? "Remove" : "Grant"} system admin`}
                      >
                        <Shield
                          className={`h-4 w-4 ${user.system_admin ? "text-red-600" : ""}`}
                        />
                      </Button>
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
    </div>
  );
}
