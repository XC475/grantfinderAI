"use client";

import { useState, useMemo, useEffect } from "react";
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
  type ColumnDef,
  type Header,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Settings2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  createColumns,
  createSimpleColumns,
  type Application,
} from "./columns";

// Sortable Header Component
function SortableHeader({
  header,
  columnId,
}: {
  header: Header<Application, unknown>;
  columnId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId, disabled: header.isPlaceholder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (header.isPlaceholder) {
    return <TableHead />;
  }

  const columnSize = header.column.getSize();

  return (
    <TableHead
      ref={setNodeRef}
      style={{
        ...style,
        width: columnSize,
        minWidth: columnSize,
        maxWidth: columnSize,
      }}
      className="relative group"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  );
}

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
    // All columns visible by default - empty object means all visible
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Column order state
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Delete dialog state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);

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

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    // Optimistic update - show success immediately
    toast.success("Status updated successfully");

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Refresh to sync with server
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");

      // Force refresh to revert optimistic update
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  // Column actions
  const actions = {
    onView: (id: string) => {
      router.push(`/private/${slug}/applications/${id}`);
    },
    onEdit: (id: string) => {
      router.push(`/private/${slug}/applications/${id}`);
    },
    onDuplicate: (_id: string) => {
      toast.info("Duplicate feature coming soon!");
    },
    onDelete: (id: string, title: string | null) => {
      setApplicationToDelete({ id, title });
      setDeleteDialogOpen(true);
    },
    onStatusChange: handleStatusUpdate,
  };

  const baseColumns = useMemo(
    () =>
      variant === "dashboard"
        ? createSimpleColumns(actions)
        : createColumns(actions),
    [variant, actions]
  );

  // Initialize column order on first render
  useEffect(() => {
    if (columnOrder.length === 0 && baseColumns.length > 0) {
      setColumnOrder(
        baseColumns.map((col, index) => {
          if (col.id) return col.id;
          // Try to get accessorKey if it exists
          const accessorKey =
            "accessorKey" in col
              ? (col.accessorKey as string | undefined)
              : undefined;
          if (typeof accessorKey === "string") return accessorKey;
          return `col-${index}`;
        })
      );
    }
  }, [baseColumns, columnOrder.length]);

  // Reorder columns based on columnOrder state
  const columns = useMemo(() => {
    if (columnOrder.length === 0) return baseColumns;

    const orderedColumns: ColumnDef<Application>[] = [];
    const columnMap = new Map(
      baseColumns.map((col, index) => {
        const id =
          col.id ||
          ("accessorKey" in col
            ? (col.accessorKey as string | undefined)
            : undefined) ||
          `col-${index}`;
        return [id, col];
      })
    );

    // Add columns in the order specified by columnOrder
    columnOrder.forEach((id) => {
      const col = columnMap.get(id);
      if (col) {
        orderedColumns.push(col);
        columnMap.delete(id);
      }
    });

    // Add any remaining columns that weren't in columnOrder
    columnMap.forEach((col) => orderedColumns.push(col));

    return orderedColumns;
  }, [baseColumns, columnOrder]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
  const draftCount = applications.filter(
    (app) => app.status === "DRAFT"
  ).length;
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
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: variant === "full",
  });

  // Dashboard variant (simplified - no tabs, no controls)
  if (variant === "dashboard") {
    const visibleHeaders =
      table
        .getHeaderGroups()[0]
        ?.headers.filter(
          (header) =>
            header.column.id !== "select" &&
            header.column.id !== "dragHandle" &&
            header.column.getIsVisible()
        ) || [];

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-muted-foreground/20 overflow-hidden bg-card/40 backdrop-blur-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table className="[&_table]:table-fixed">
              <TableHeader className="bg-muted/30 border-b border-muted-foreground/10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent border-none"
                  >
                    <SortableContext
                      items={visibleHeaders.map((h) => h.column.id || h.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers
                        .filter(
                          (header) =>
                            header.column.id !== "select" &&
                            header.column.id !== "dragHandle"
                        )
                        .map((header) => (
                          <SortableHeader
                            key={header.id}
                            header={header}
                            columnId={header.column.id || header.id}
                          />
                        ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-foreground/5 border-b border-muted-foreground/5 transition-colors last:border-none"
                      onClick={() =>
                        router.push(
                          `/private/${slug}/applications/${row.original.id}`
                        )
                      }
                    >
                      {row
                        .getVisibleCells()
                        .filter(
                          (cell) =>
                            cell.column.id !== "select" &&
                            cell.column.id !== "dragHandle"
                        )
                        .map((cell) => {
                          const columnSize = cell.column.getSize();
                          return (
                            <TableCell
                              key={cell.id}
                              className="font-light text-foreground/80"
                              style={{
                                width: columnSize,
                                minWidth: columnSize,
                                maxWidth: columnSize,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length - 2}
                      className="h-24 text-center text-foreground/60 font-light"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
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
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="draft">
              Draft
              {draftCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 px-1.5 py-0.5 text-xs"
                >
                  {draftCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted
              {submittedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 px-1.5 py-0.5 text-xs"
                >
                  {submittedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {approvedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 px-1.5 py-0.5 text-xs"
                >
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
                    (column) => column.getCanHide() && column.id !== "select"
                  )
                  .map((column) => {
                    const columnNames: Record<string, string> = {
                      dragHandle: "Drag Handle",
                      title: "Application Name",
                      status: "Status",
                      funding: "Funding Amount",
                      deadline: "Deadline",
                      lastEditedAt: "Last Edited",
                      createdAt: "Created At",
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
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="rounded-md border [&_[data-slot=table-container]]:overflow-visible">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table className="w-full [&_table]:table-fixed">
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => {
                    const selectHeader = headerGroup.headers.find(
                      (h) => h.column.id === "select"
                    );
                    const dragHandleHeader = headerGroup.headers.find(
                      (h) => h.column.id === "dragHandle"
                    );
                    const sortableHeaders = headerGroup.headers.filter(
                      (header) =>
                        header.column.getIsVisible() &&
                        header.column.id !== "select" &&
                        header.column.id !== "dragHandle"
                    );
                    return (
                      <TableRow key={headerGroup.id}>
                        {/* Render select column first (not sortable) */}
                        {selectHeader && (
                          <TableHead
                            key={selectHeader.id}
                            style={{
                              width: selectHeader.column.getSize(),
                              minWidth: selectHeader.column.getSize(),
                              maxWidth: selectHeader.column.getSize(),
                            }}
                          >
                            {flexRender(
                              selectHeader.column.columnDef.header,
                              selectHeader.getContext()
                            )}
                          </TableHead>
                        )}
                        {/* Render dragHandle column (not sortable) */}
                        {dragHandleHeader &&
                          dragHandleHeader.column.getIsVisible() && (
                            <TableHead
                              key={dragHandleHeader.id}
                              style={{
                                width: dragHandleHeader.column.getSize(),
                                minWidth: dragHandleHeader.column.getSize(),
                                maxWidth: dragHandleHeader.column.getSize(),
                              }}
                            >
                              {flexRender(
                                dragHandleHeader.column.columnDef.header,
                                dragHandleHeader.getContext()
                              )}
                            </TableHead>
                          )}
                        {/* Render sortable columns */}
                        <SortableContext
                          items={sortableHeaders.map(
                            (h) => h.column.id || h.id
                          )}
                          strategy={horizontalListSortingStrategy}
                        >
                          {sortableHeaders.map((header) => (
                            <SortableHeader
                              key={header.id}
                              header={header}
                              columnId={header.column.id || header.id}
                            />
                          ))}
                        </SortableContext>
                      </TableRow>
                    );
                  })}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          router.push(
                            `/private/${slug}/applications/${row.original.id}`
                          )
                        }
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnSize = cell.column.getSize();
                          return (
                            <TableCell
                              key={cell.id}
                              style={{
                                width: columnSize,
                                minWidth: columnSize,
                                maxWidth: columnSize,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
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
            </DndContext>
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
              action cannot be undone. Associated documents will also be
              deleted.
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

      {/* Add Application Modal */}
    </div>
  );
}
