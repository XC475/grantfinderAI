"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
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

interface Application {
  id: string;
  opportunityId: number;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  lastEditedAt: string;
  organization: {
    slug: string;
    name: string;
  };
  opportunity?: {
    total_funding_amount: number | null;
    close_date: string | null;
  };
}

interface ApplicationsTableProps {
  applications: Application[];
  slug: string;
  onRefresh?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "READY_TO_SUBMIT":
      return "bg-purple-100 text-purple-800";
    case "SUBMITTED":
      return "bg-green-100 text-green-800";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "AWARDED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApplicationsTable({
  applications,
  slug,
  onRefresh,
}: ApplicationsTableProps) {
  const router = useRouter();
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, application: Application) => {
    e.stopPropagation(); // Prevent row click
    setApplicationToDelete({ id: application.id, title: application.title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/applications/${applicationToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      toast.success("Application deleted successfully");
      // Refresh the applications list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  // Define table columns with resizing support
  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "title",
      header: "Application Name",
      cell: ({ row }) => (
        <div className="cursor-pointer">
          <div className="font-medium hover:underline line-clamp-1">
            {row.original.title || `Grant #${row.original.opportunityId}`}
          </div>
          <div className="text-sm text-muted-foreground">
            Opportunity ID: {row.original.opportunityId}
          </div>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {formatStatus(row.original.status)}
        </Badge>
      ),
      size: 150,
    },
    {
      accessorKey: "funding",
      header: "Funding Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.opportunity?.total_funding_amount)}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.opportunity?.close_date
            ? new Date(row.original.opportunity.close_date).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )
            : "No deadline"}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "lastEditedAt",
      header: "Last Edited",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.lastEditedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
      size: 140,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => handleDeleteClick(e, row.original)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 60,
      enableResizing: false,
    },
  ];

  const table = useReactTable({
    data: applications,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeDirection: "ltr",
  });

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="overflow-x-auto">
        <Table style={{ width: table.getTotalSize(), tableLayout: "fixed" }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="relative"
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 hover:opacity-100 ${
                        header.column.getIsResizing()
                          ? "bg-primary opacity-100"
                          : ""
                      }`}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer group"
                  onClick={() =>
                    router.push(
                      `/private/${slug}/applications/${row.original.id}`
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="p-4 text-muted-foreground text-sm border-t">
        💡 Drag column edges to resize. Click on any row to view application
        details.
      </p>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {applicationToDelete?.title || "this application"}&quot;? This
              action cannot be undone. Associated documents will be preserved
              and can be found in the Documents page.
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
