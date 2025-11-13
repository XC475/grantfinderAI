"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createColumns, type Application } from "./columns";

interface ApplicationsTableProps {
  applications: Application[];
  slug: string;
  onRefresh?: () => void;
  variant?: "dashboard" | "full";
}

export function ApplicationsTable({
  applications,
  slug,
  onRefresh,
  variant = "full",
}: ApplicationsTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    select: variant === "full",
    dragHandle: false,
    lastEditedAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Delete dialog state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);

  // Column actions
  const actions = {
    onView: (id: string) => {
      router.push(`/private/${slug}/applications/${id}`);
    },
    onEdit: (id: string) => {
      router.push(`/private/${slug}/applications/${id}`);
    },
    onDuplicate: (id: string) => {
      toast.info("Duplicate feature coming soon!");
    },
    onDelete: (id: string, title: string | null) => {
      setApplicationToDelete({ id, title });
      setDeleteDialogOpen(true);
    },
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

  const columns = useMemo(() => createColumns(actions), [slug]);

  // Filter applications by tab
  const filteredApplications = useMemo(() => {
    if (activeTab === "all") return applications;
    if (activeTab === "draft") {
      return applications.filter((app) => app.status === "DRAFT");
    }
    if (activeTab === "submitted") {
      return applications.filter(
        (app) => app.status === "SUBMITTED" || app.status === "UNDER_REVIEW"
      );
    }
    if (activeTab === "approved") {
      return applications.filter(
        (app) => app.status === "APPROVED" || app.status === "AWARDED"
      );
    }
    return applications;
  }, [applications, activeTab]);

  // Count for badges
  const draftCount = applications.filter((app) => app.status === "DRAFT").length;
  const submittedCount = applications.filter(
    (app) => app.status === "SUBMITTED" || app.status === "UNDER_REVIEW"
  ).length;
  const approvedCount = applications.filter(
    (app) => app.status === "APPROVED" || app.status === "AWARDED"
  ).length;

  const table = useReactTable({
    data: filteredApplications,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: variant === "full",
  });

  // Dashboard variant (simplified - no tabs, no controls)
  if (variant === "dashboard") {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers
                    .filter((header) => header.column.id !== "select" && header.column.id !== "dragHandle")
                    .map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(`/private/${slug}/applications/${row.original.id}`)
                    }
                  >
                    {row
                      .getVisibleCells()
                      .filter((cell) => cell.column.id !== "select" && cell.column.id !== "dragHandle")
                      .map((cell) => (
                        <TableCell key={cell.id}>
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
                    colSpan={columns.length - 2}
                    className="h-24 text-center"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Full variant with tabs and all features
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">
              All Applications
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              {draftCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {draftCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted
              {submittedCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {submittedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {approvedCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {approvedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <Input
              placeholder="Search applications..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-[250px]"
            />

            {/* Customize Columns */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      column.getCanHide() && column.id !== "select"
                  )
                  .map((column) => {
                    const columnNames: Record<string, string> = {
                      dragHandle: "Drag Handle",
                      title: "Application Name",
                      status: "Status",
                      funding: "Funding Amount",
                      deadline: "Deadline",
                      lastEditedAt: "Last Edited",
                      actions: "Actions",
                    };
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {columnNames[column.id] || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Application Button */}
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/private/${slug}/applications/${row.original.id}`)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Row count info */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} application(s)
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                ` · ${table.getFilteredSelectedRowModel().rows.length} selected`}
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
