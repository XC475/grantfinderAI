"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomField {
  id: string;
  name: string;
  description: string | null;
  value: string;
}

export function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deletingField, setDeletingField] = useState<CustomField | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDescription, setNewFieldDescription] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [editFieldName, setEditFieldName] = useState("");
  const [editFieldDescription, setEditFieldDescription] = useState("");
  const [editFieldValue, setEditFieldValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  // Listen for custom event to open add dialog from parent
  useEffect(() => {
    const handleOpenAddDialog = () => {
      setShowAddDialog(true);
    };
    window.addEventListener("open-add-custom-field-dialog", handleOpenAddDialog);
    return () => {
      window.removeEventListener(
        "open-add-custom-field-dialog",
        handleOpenAddDialog
      );
    };
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/custom-fields");
      if (!response.ok) throw new Error("Failed to fetch custom fields");

      const data = await response.json();
      setFields(data.customFields || []);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      toast.error("Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    if (!newFieldValue.trim()) {
      toast.error("Field value is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFieldName.trim(),
          description: newFieldDescription.trim() || null,
          value: newFieldValue.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create custom field");
      }

      toast.success("Custom field created successfully");
      setNewFieldName("");
      setNewFieldDescription("");
      setNewFieldValue("");
      setShowAddDialog(false);
      fetchFields();
    } catch (error) {
      console.error("Error creating custom field:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create custom field"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditField = async () => {
    if (!editingField || !editFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }

    if (!editFieldValue.trim()) {
      toast.error("Field value is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/custom-fields/${editingField.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFieldName.trim(),
          description: editFieldDescription.trim() || null,
          value: editFieldValue.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update custom field");
      }

      toast.success("Custom field updated successfully");
      setEditingField(null);
      setEditFieldName("");
      setEditFieldDescription("");
      setEditFieldValue("");
      fetchFields();
    } catch (error) {
      console.error("Error updating custom field:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update custom field"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async () => {
    if (!deletingField) return;

    try {
      const response = await fetch(`/api/custom-fields/${deletingField.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete custom field");
      }

      toast.success("Custom field deleted successfully");
      setDeletingField(null);
      fetchFields();
    } catch (error) {
      console.error("Error deleting custom field:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete custom field"
      );
    }
  };

  const startEdit = (field: CustomField) => {
    setEditingField(field);
    setEditFieldName(field.name);
    setEditFieldDescription(field.description || "");
    setEditFieldValue(field.value);
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
        {fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              No custom fields yet. Create your first custom field to get
              started.
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="group flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{field.name}</span>
                  </div>
                  {field.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {field.description}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground truncate">
                    {field.value}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(field)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingField(field)}
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

      {/* Add Custom Field Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
            <DialogDescription>
              Create a new custom field to add to your organization profile.
              These fields will be included in AI prompts to provide additional
              context.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name *</Label>
              <Input
                id="field-name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g., Primary Focus Area"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleAddField();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-description">Description (optional)</Label>
              <Textarea
                id="field-description"
                value={newFieldDescription}
                onChange={(e) => setNewFieldDescription(e.target.value)}
                placeholder="Brief description of what this field represents"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-value">Field Value *</Label>
              <Textarea
                id="field-value"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Enter the value for this field"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewFieldName("");
                setNewFieldDescription("");
                setNewFieldValue("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddField} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Field"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Custom Field Dialog */}
      <Dialog
        open={!!editingField}
        onOpenChange={(open) => {
          if (!open) {
            setEditingField(null);
            setEditFieldName("");
            setEditFieldDescription("");
            setEditFieldValue("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
            <DialogDescription>
              Update the custom field information. Field names must be unique
              within your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-field-name">Field Name *</Label>
              <Input
                id="edit-field-name"
                value={editFieldName}
                onChange={(e) => setEditFieldName(e.target.value)}
                placeholder="e.g., Primary Focus Area"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleEditField();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-field-description">
                Description (optional)
              </Label>
              <Textarea
                id="edit-field-description"
                value={editFieldDescription}
                onChange={(e) => setEditFieldDescription(e.target.value)}
                placeholder="Brief description of what this field represents"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-field-value">Field Value *</Label>
              <Textarea
                id="edit-field-value"
                value={editFieldValue}
                onChange={(e) => setEditFieldValue(e.target.value)}
                placeholder="Enter the value for this field"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingField(null);
                setEditFieldName("");
                setEditFieldDescription("");
                setEditFieldValue("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditField} disabled={saving}>
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
        open={!!deletingField}
        onOpenChange={(open) => {
          if (!open) setDeletingField(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingField?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingField(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteField}
              className="text-destructive-foreground"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

