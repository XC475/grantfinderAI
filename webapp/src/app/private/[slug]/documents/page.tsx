"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  content?: string;
  contentType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  applicationId?: string | null;
  application?: {
    id: string;
    title: string | null;
    opportunityId: number;
  } | null;
}

interface DocumentsPageProps {
  params: Promise<{ slug: string }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    applicationId?: string | null;
  } | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  const fetchDocuments = async (resetOffset = true, customOffset?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", pagination.limit.toString());
      const offset = resetOffset
        ? 0
        : customOffset !== undefined
          ? customOffset
          : pagination.offset;
      params.append("offset", offset.toString());

      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const data = responseData.data || [];

      // Update documents based on reset flag
      if (resetOffset) {
        setDocuments(data);
      } else {
        setDocuments((prev) => [...prev, ...data]);
      }

      setPagination(responseData.pagination);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    fetchDocuments(false, pagination.offset + pagination.limit);
  };

  const handleEdit = (documentId: string, applicationId?: string | null) => {
    if (applicationId) {
      router.push(
        `/private/${slug}/applications/${applicationId}/documents/${documentId}`
      );
    } else {
      // For standalone documents, navigate to a standalone editor (if you create one)
      toast.info("Standalone document editor coming soon");
    }
  };

  const handleDeleteClick = (
    documentId: string,
    applicationId?: string | null
  ) => {
    setDocumentToDelete({ id: documentId, applicationId });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const url = documentToDelete.applicationId
        ? `/api/applications/${documentToDelete.applicationId}/documents/${documentToDelete.id}`
        : `/api/documents/${documentToDelete.id}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      toast.success("Document deleted successfully");
      // Refresh the documents list
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMinutes < 60) {
        return diffMinutes === 0
          ? "just now"
          : `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
      } else if (diffMonths < 12) {
        return `about ${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return "Unknown";
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="p-4 mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className="text-muted-foreground">
            View and manage all your grant application documents
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-4 mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Documents</h1>
          <p className="text-muted-foreground">
            View and manage all your grant application documents
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documents</h3>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <p>No documents yet. Create your first document to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground">
          View and manage all your grant application documents
        </p>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <div className="space-y-0">
          {/* Header Row */}
          <div className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground border-b">
            <div className="flex-1 min-w-0">Name</div>
            <div className="w-64">Application</div>
            <div className="w-40">Updated at</div>
          </div>

          {/* Document Rows */}
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center px-4 py-3 border-b hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span
                  className="font-medium hover:underline cursor-pointer truncate"
                  onClick={() =>
                    handleEdit(document.id, document.applicationId)
                  }
                >
                  {document.title}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteClick(document.id, document.applicationId)
                      }
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="w-64 text-sm text-muted-foreground truncate">
                {document.application?.title || "No application"}
              </div>
              <div className="w-40 text-sm text-muted-foreground">
                {formatDate(document.updatedAt)}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
