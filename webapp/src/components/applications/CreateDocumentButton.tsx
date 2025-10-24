"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateDocumentModal } from "./CreateDocumentModal";
import { useState } from "react";

interface CreateDocumentButtonProps {
  applicationId: string;
  organizationSlug: string;
  onSuccess: () => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
}

export function CreateDocumentButton({
  applicationId,
  organizationSlug,
  onSuccess,
  isCreating,
  setIsCreating,
}: CreateDocumentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };

  return (
    <>
      <Button onClick={handleCreate} disabled={isCreating} className="h-8 px-3">
        <Plus className="h-4 w-4 mr-1" />
        {isCreating ? "Creating..." : "Create Document"}
      </Button>

      <CreateDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        applicationId={applicationId}
        organizationSlug={organizationSlug}
      />
    </>
  );
}
