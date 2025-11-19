"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CustomField {
  id: string;
  fieldName: string;
  fieldValue: string | null;
}

interface CustomFieldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: CustomField | null; // null for create mode, field object for edit mode
  onSave: (fieldName: string, fieldValue: string) => Promise<void>;
}

export function CustomFieldModal({
  open,
  onOpenChange,
  field,
  onSave,
}: CustomFieldModalProps) {
  const [fieldName, setFieldName] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = field !== null;

  // Reset form when modal opens/closes or field changes
  useEffect(() => {
    if (open) {
      if (field) {
        setFieldName(field.fieldName);
        setFieldValue(field.fieldValue || "");
      } else {
        setFieldName("");
        setFieldValue("");
      }
      setError("");
    }
  }, [open, field]);

  const handleSave = async () => {
    // Validate
    if (!fieldName.trim()) {
      setError("Field name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(fieldName.trim(), fieldValue);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save field");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Custom Field" : "Add Custom Field"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your custom field information."
              : "Add a new custom field to your organization profile."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fieldName">Field Name *</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., Founding Year, Staff Count, Special Programs"
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fieldValue">Field Value</Label>
            <Textarea
              id="fieldValue"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              rows={8}
              placeholder="Enter detailed information for this field..."
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              This field supports large text similar to Strategic Plan
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

