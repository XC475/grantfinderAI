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
import { RenameDialog } from "@/components/folders/RenameDialog";

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

  // Visible status filters in the tab row (capped)
  const MAX_VISIBLE_STATUSES = 5;
  const [visibleStatusKeys, setVisibleStatusKeys] = useState<string[]>([]);

  // Column order state
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Delete dialog state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);

  // Rename dialog state
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    applicationId: string;
    currentTitle: string;
  }>({ open: false, applicationId: "", currentTitle: "" });

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

  const handleRenameSubmit = async (newTitle: string) => {
    try {
      const response = await fetch(
        `/api/applications/${renameDialog.applicationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to rename application");
      }

      toast.success("Application renamed successfully");
      onRefresh?.();
    } catch (error) {
      console.error("Error renaming application:", error);
      throw error;
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
    onRename: (id: string, currentTitle: string) => {
      setRenameDialog({ open: true, applicationId: id, currentTitle });
    },
    onDuplicate: async (id: string) => {
      try {
        const response = await fetch(`/api/applications/${id}/copy`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to copy application");
        }

        const data = await response.json();
        toast.success("Application copied successfully");
        onRefresh?.(); // Refresh the table
        router.push(`/private/${slug}/applications/${data.application.id}`);
      } catch (error) {
        console.error("Error copying application:", error);
        toast.error("Failed to copy application");
      }
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

  // Status filter configuration (tabs)
  const statusFilters = useMemo(
    () => [
      // Order matters here – it controls the left-to-right order of the filters
      {
        value: "draft",
        label: "Draft",
        statuses: ["DRAFT"],
      },
      {
        value: "in_progress",
        label: "In Progress",
        statuses: ["IN_PROGRESS"],
      },
      {
        value: "ready_to_submit",
        label: "Ready to Submit",
        statuses: ["READY_TO_SUBMIT"],
      },
      {
        value: "submitted",
        label: "Submitted",
        statuses: ["SUBMITTED"],
      },
      {
        value: "under_review",
        label: "Under Review",
        statuses: ["UNDER_REVIEW"],
      },
      {
        value: "awarded",
        label: "Awarded",
        statuses: ["AWARDED"],
      },
      {
        value: "rejected",
        label: "Rejected",
        statuses: ["REJECTED"],
      },
      {
        value: "withdrawn",
        label: "Withdrawn",
        statuses: ["WITHDRAWN"],
      },
    ],
    []
  );

  // Count applications per status filter (used for badges and defaults)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const filter of statusFilters) {
      counts[filter.value] = applications.filter((app) =>
        filter.statuses.includes(app.status)
      ).length;
    }
    return counts;
  }, [applications, statusFilters]);

  // Initialize visible status tabs on first render (up to MAX_VISIBLE_STATUSES)
  useEffect(() => {
    if (visibleStatusKeys.length > 0) return;

    const orderedKeys = statusFilters.map((f) => f.value);

    // Prefer statuses that actually have applications
    const nonEmptyKeys = orderedKeys.filter(
      (key) => (statusCounts[key] ?? 0) > 0
    );

    const initial: string[] = [];
    for (const key of nonEmptyKeys) {
      if (initial.length >= MAX_VISIBLE_STATUSES) break;
      if (!initial.includes(key)) initial.push(key);
    }

    // If we still have room, fill from remaining statuses (in order)
    if (initial.length < Math.min(MAX_VISIBLE_STATUSES, orderedKeys.length)) {
      for (const key of orderedKeys) {
        if (initial.length >= MAX_VISIBLE_STATUSES) break;
        if (!initial.includes(key)) initial.push(key);
      }
    }

    setVisibleStatusKeys(initial);
  }, [statusCounts, statusFilters, visibleStatusKeys.length]);

  // Filter applications by active tab
  const filteredApplications = useMemo(() => {
    if (activeTab === "all") return applications;
    const filter = statusFilters.find((f) => f.value === activeTab);
    if (!filter) return applications;
    return applications.filter((app) => filter.statuses.includes(app.status));
  }, [applications, activeTab, statusFilters]);

  // Handle toggling a status in the overflow menu
  const handleToggleVisibleStatus = (value: string, checked: boolean) => {
    setVisibleStatusKeys((current) => {
      // Removing from visible list
      if (!checked) {
        const next = current.filter((key) => key !== value);
        if (activeTab === value) {
          setActiveTab("all");
        }
        return next;
      }

      // Adding to visible list
      if (current.includes(value)) {
        return current;
      }

      if (current.length >= MAX_VISIBLE_STATUSES) {
        toast.error("You can show up to 5 filters at a time.");
        return current;
      }

      // Preserve canonical order by inserting based on statusFilters
      const orderedKeys = statusFilters.map((f) => f.value);
      const next = [...current, value];
      next.sort(
        (a, b) => orderedKeys.indexOf(a) - orderedKeys.indexOf(b)
      );

      return next;
    });

    if (checked) {
      setActiveTab(value);
    }
  };

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
        <div className="mb-4 space-y-2">
          {/* Top row: Search + Columns (left aligned, above filter bar) */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search applications..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-[260px]"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
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

          {/* Second row: status bar + More filters (More filters adjacent to bar) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TabsList className="flex flex-nowrap gap-1 overflow-x-auto flex-shrink-0">
                <TabsTrigger value="all">All Applications</TabsTrigger>
                {statusFilters
                  .filter((filter) => visibleStatusKeys.includes(filter.value))
                  .map((filter) => {
                    const count = statusCounts[filter.value] ?? 0;
                    return (
                      <TabsTrigger key={filter.value} value={filter.value}>
                        {filter.label}
                        {count > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 px-1.5 py-0.5 text-xs"
                          >
                            {count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    More filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  <DropdownMenuLabel>Status filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusFilters.map((filter) => {
                    const count = statusCounts[filter.value] ?? 0;
                    const checked = visibleStatusKeys.includes(filter.value);
                    const disabled =
                      !checked &&
                      visibleStatusKeys.length >= MAX_VISIBLE_STATUSES;

                    return (
                      <DropdownMenuCheckboxItem
                        key={filter.value}
                        checked={checked}
                        disabled={disabled}
                        className="flex items-center justify-between gap-2"
                        onCheckedChange={(value) =>
                          handleToggleVisibleStatus(
                            filter.value,
                            Boolean(value)
                          )
                        }
                      >
                        <span>{filter.label}</span>
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {count}
                          </span>
                        )}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Spacer to visually separate controls from table */}
          <div className="h-1" />
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="rounded-md border">
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

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
        itemType="application"
        currentName={renameDialog.currentTitle}
        onRename={handleRenameSubmit}
        warningMessage="Renaming this application will also rename its linked folder."
      />

      {/* Add Application Modal */}
    </div>
  );
}
