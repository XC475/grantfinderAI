"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  UserPlus,
  Loader2,
  MoreVertical,
  Trash2,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  lastActiveAt: string;
}

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<
    "OWNER" | "ADMIN" | "MEMBER" | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Role change state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(
    null
  );
  const [newRole, setNewRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/organizations/members");

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setMembers(data.members || []);
      setCurrentUserRole(data.currentUserRole);

      // Get current user ID
      const userResponse = await fetch("/api/user");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    const name = member.name?.toLowerCase() || "";
    const email = member.email.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const names = name.trim().split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "OWNER") return "default";
    return "secondary";
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error("Please fill in all fields");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/organizations/invite-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to invite user");
      }

      const result = await response.json();
      toast.success(
        result.emailSent
          ? "Invitation sent! User will receive welcome email."
          : "User created, but email failed to send."
      );

      setIsDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("MEMBER");
      fetchMembers(); // Refresh member list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite user"
      );
    } finally {
      setInviting(false);
    }
  };

  const canInviteMembers =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  // Handle delete member
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/organizations/members/${memberToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete member");
      }

      toast.success(
        `${memberToDelete.name || memberToDelete.email} has been removed from the team`
      );
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      fetchMembers(); // Refresh member list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete member"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle role change
  const handleChangeRole = async () => {
    if (!memberToChangeRole) return;

    setChangingRole(true);
    try {
      const response = await fetch(
        `/api/organizations/members/${memberToChangeRole.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change role");
      }

      toast.success(
        `${memberToChangeRole.name || memberToChangeRole.email}'s role updated to ${newRole === "ADMIN" ? "Admin" : "Member"}`
      );
      setRoleDialogOpen(false);
      setMemberToChangeRole(null);
      fetchMembers(); // Refresh member list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change role"
      );
    } finally {
      setChangingRole(false);
    }
  };

  // Check if current user can manage a member
  const canManageMember = (member: Member) => {
    // Can't manage yourself
    if (member.id === currentUserId) return false;

    // Can't manage owner
    if (member.role === "OWNER") return false;

    // Owner can manage everyone
    if (currentUserRole === "OWNER") return true;

    // Admin can only manage members
    if (currentUserRole === "ADMIN" && member.role === "MEMBER") return true;

    return false;
  };

  // Check if current user can delete a member
  const canDeleteMember = (member: Member) => {
    return canManageMember(member);
  };

  // Check if current user can change roles (only owner)
  const canChangeRole = (member: Member) => {
    if (member.id === currentUserId) return false;
    if (member.role === "OWNER") return false;
    return currentUserRole === "OWNER";
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your organization members
          </p>
        </div>
        {canInviteMembers && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to your workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value: "ADMIN" | "MEMBER") =>
                      setInviteRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={inviting}
                  className="w-full"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending invite...
                    </>
                  ) : (
                    "Send invite"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {!canInviteMembers && currentUserRole === "MEMBER" && (
          <p className="text-sm text-muted-foreground">
            Contact an admin to invite new members
          </p>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No members found matching your search"
              : "No team members yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(member.name, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.name || "No name"}</p>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role === "OWNER"
                        ? "Owner"
                        : member.role === "ADMIN"
                          ? "Admin"
                          : "Member"}
                    </Badge>
                    {member.id === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {getRelativeTime(member.lastActiveAt)}
                </p>

                {/* Only show menu if user can manage this member */}
                {canManageMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Manage member</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {canChangeRole(member) && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setMemberToChangeRole(member);
                              setNewRole(
                                member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                              );
                              setRoleDialogOpen(true);
                            }}
                          >
                            {member.role === "ADMIN" ? (
                              <>
                                <User className="h-4 w-4 mr-2" />
                                Change to Member
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Change to Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {canDeleteMember(member) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setMemberToDelete(member);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from team
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete team member?</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <strong>{memberToDelete?.name || memberToDelete?.email}</strong>{" "}
              from your organization.
              <br />
              <br />
              <span className="text-destructive font-medium">
                Their personal chats and bookmarks will be deleted. Applications
                belong to the organization and will remain.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change member role</DialogTitle>
            <DialogDescription>
              Update the role for{" "}
              <span className="font-semibold">
                {memberToChangeRole?.name || memberToChangeRole?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select
                value={newRole}
                onValueChange={(value: "ADMIN" | "MEMBER") => setNewRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium">Member</div>
                        <div className="text-xs text-muted-foreground">
                          Can view and collaborate on grants
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium">Admin</div>
                        <div className="text-xs text-muted-foreground">
                          Can manage members and settings
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={changingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={changingRole}>
              {changingRole ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
