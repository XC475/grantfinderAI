"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DocumentTag {
  id: string;
  name: string;
  _count: {
    documents: number;
  };
}

export function DocumentTagsManager() {
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);
  const [deletingTag, setDeletingTag] = useState<DocumentTag | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editTagName, setEditTagName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  // Listen for custom event to open add dialog from parent
  useEffect(() => {
    const handleOpenAddDialog = () => {
      setShowAddDialog(true);
    };
    window.addEventListener("open-add-tag-dialog", handleOpenAddDialog);
    return () => {
      window.removeEventListener("open-add-tag-dialog", handleOpenAddDialog);
    };
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/document-tags");
      if (!response.ok) throw new Error("Failed to fetch tags");

      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load document tags");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/document-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tag");
      }

      toast.success("Tag created successfully");
      setNewTagName("");
      setShowAddDialog(false);
      fetchTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create tag"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/document-tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTagName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update tag");
      }

      toast.success("Tag updated successfully");
      setEditingTag(null);
      setEditTagName("");
      fetchTags();

      // Trigger knowledge base refresh to update tag names
      window.dispatchEvent(new Event("knowledge-base-refresh"));
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update tag"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deletingTag) return;

    try {
      const response = await fetch(`/api/document-tags/${deletingTag.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tag");
      }

      toast.success("Tag deleted successfully");
      setDeletingTag(null);
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete tag"
      );
    }
  };

  const startEdit = (tag: DocumentTag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tags.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No tags yet. Create your first tag to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{tag.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tag._count.documents} document
                    {tag._count.documents !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingTag(tag)}
                    disabled={tag._count.documents > 0}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Tag Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to organize your documents. Tag names must be
              unique within your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tag-name" className="text-sm font-medium">
                Tag Name
              </label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Budget Documents"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewTagName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTag}
              disabled={saving || !newTagName.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tag"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog
        open={!!editingTag}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTag(null);
            setEditTagName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document Tag</DialogTitle>
            <DialogDescription>
              Update the tag name. This will update the tag for all documents
              using it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-tag-name" className="text-sm font-medium">
                Tag Name
              </label>
              <Input
                id="edit-tag-name"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="e.g., Budget Documents"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditTag();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTag(null);
                setEditTagName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTag}
              disabled={saving || !editTagName.trim()}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingTag}
        onOpenChange={(open) => {
          if (!open) setDeletingTag(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              {deletingTag && deletingTag._count.documents > 0 ? (
                <>
                  Cannot delete tag &quot;{deletingTag.name}&quot; because it is
                  being used by {deletingTag._count.documents} document
                  {deletingTag._count.documents !== 1 ? "s" : ""}. Please remove
                  the tag from all documents first.
                </>
              ) : (
                <>
                  Are you sure you want to delete the tag &quot;
                  {deletingTag?.name}&quot;? This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTag(null)}>
              Cancel
            </Button>
            {deletingTag?._count.documents === 0 && (
              <Button onClick={handleDeleteTag} variant="destructive">
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
