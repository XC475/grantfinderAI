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
  type ColumnDef,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  MoreVertical,
  Copy,
  Trash,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createColumns,
  createSimpleColumns,
  type Application,
} from "./columns";
import { RenameDialog } from "@/components/folders/RenameDialog";
import { getStatusVariant, formatStatus } from "./StatusSelect";

interface ApplicationsTableProps {
  applications: Application[];
  slug: string;
  onRefresh?: () => void;
  variant?: "dashboard" | "full";
  onNewApplication?: () => void;
}

export function ApplicationsTable({
  applications,
  slug,
  onRefresh,
  variant = "full",
  onNewApplication,
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

  // New filter state
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [fundingRangeFilter, setFundingRangeFilter] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({ min: undefined, max: undefined });

  // Delete dialog state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    title: string | null;
  } | null>(null);
  const [applicationsToDelete, setApplicationsToDelete] = useState<
    Array<{ id: string; title: string | null }>
  >([]);

  // Rename dialog state
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    applicationId: string;
    currentTitle: string;
  }>({ open: false, applicationId: "", currentTitle: "" });

  const confirmDelete = async () => {
    // Handle bulk delete
    if (applicationsToDelete.length > 0) {
      setIsDeleting(true);
      let successCount = 0;
      let failCount = 0;

      try {
        for (const app of applicationsToDelete) {
          try {
            const response = await fetch(`/api/applications/${app.id}`, {
              method: "DELETE",
            });

            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            console.error(`Error deleting application ${app.id}:`, error);
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(
            `Successfully deleted ${successCount} application${successCount > 1 ? "s" : ""}`
          );
        }
        if (failCount > 0) {
          toast.error(
            `Failed to delete ${failCount} application${failCount > 1 ? "s" : ""}`
          );
        }

        if (onRefresh) {
          onRefresh();
        }
        // Clear selection
        setRowSelection({});
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete applications");
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setApplicationsToDelete([]);
      }
      return;
    }

    // Handle single delete
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

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const apps = selectedRows.map((row) => ({
      id: row.original.id,
      title: row.original.title,
    }));
    setApplicationsToDelete(apps);
    setDeleteDialogOpen(true);
  };

  const handleBulkCopy = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    let successCount = 0;
    let failCount = 0;

    try {
      for (const row of selectedRows) {
        try {
          const response = await fetch(`/api/applications/${row.original.id}/copy`, {
            method: "POST",
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error copying application ${row.original.id}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `Successfully copied ${successCount} application${successCount > 1 ? "s" : ""}`
        );
      }
      if (failCount > 0) {
        toast.error(
          `Failed to copy ${failCount} application${failCount > 1 ? "s" : ""}`
        );
      }

      if (onRefresh) {
        onRefresh();
      }
      // Clear selection
      setRowSelection({});
    } catch (error) {
      console.error("Error in bulk copy:", error);
      toast.error("Failed to copy applications");
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

  const columns = useMemo(
    () =>
      variant === "dashboard"
        ? createSimpleColumns(actions)
        : createColumns(actions),
    [variant, actions]
  );

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

  // Count applications per status filter (used for badges)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const filter of statusFilters) {
      counts[filter.value] = applications.filter((app) =>
        filter.statuses.includes(app.status)
      ).length;
    }
    return counts;
  }, [applications, statusFilters]);

  // Filter applications using new filter state
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Status filters (multi-select)
    if (selectedStatusFilters.length > 0) {
      filtered = filtered.filter((app) => {
        // Find which filter group this status belongs to
        const matchingFilter = statusFilters.find((filter) =>
          filter.statuses.includes(app.status)
        );
        return (
          matchingFilter && selectedStatusFilters.includes(matchingFilter.value)
        );
      });
    }

    // Date range filter (on deadline/closeDate)
    if (dateRangeFilter.from || dateRangeFilter.to) {
      filtered = filtered.filter((app) => {
        if (!app.opportunityCloseDate) return false;
        const closeDate = new Date(app.opportunityCloseDate);
        // Reset time to start of day for comparison
        const fromDate = dateRangeFilter.from
          ? new Date(
              dateRangeFilter.from.getFullYear(),
              dateRangeFilter.from.getMonth(),
              dateRangeFilter.from.getDate()
            )
          : null;
        const toDate = dateRangeFilter.to
          ? new Date(
              dateRangeFilter.to.getFullYear(),
              dateRangeFilter.to.getMonth(),
              dateRangeFilter.to.getDate(),
              23,
              59,
              59,
              999
            )
          : null;
        const appDate = new Date(
          closeDate.getFullYear(),
          closeDate.getMonth(),
          closeDate.getDate()
        );

        if (fromDate && appDate < fromDate) return false;
        if (toDate && appDate > toDate) return false;
        return true;
      });
    }

    // Funding range filter
    if (fundingRangeFilter.min !== undefined || fundingRangeFilter.max !== undefined) {
      filtered = filtered.filter((app) => {
        const amount = app.opportunityTotalFunding
          ? Number(app.opportunityTotalFunding)
          : null;
        if (amount === null) return false;
        if (
          fundingRangeFilter.min !== undefined &&
          amount < fundingRangeFilter.min
        )
          return false;
        if (
          fundingRangeFilter.max !== undefined &&
          amount > fundingRangeFilter.max
        )
          return false;
        return true;
      });
    }

    return filtered;
  }, [
    applications,
    selectedStatusFilters,
    dateRangeFilter,
    fundingRangeFilter,
  ]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStatusFilters.length > 0) count++;
    if (dateRangeFilter.from || dateRangeFilter.to) count++;
    if (
      fundingRangeFilter.min !== undefined ||
      fundingRangeFilter.max !== undefined
    )
      count++;
    return count;
  }, [selectedStatusFilters, dateRangeFilter, fundingRangeFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStatusFilters([]);
    setDateRangeFilter({ from: undefined, to: undefined });
    setFundingRangeFilter({ min: undefined, max: undefined });
  };

  // Get current sort state for display
  const currentSort = useMemo(() => {
    if (sorting.length === 0) return null;
    const sort = sorting[0];
    return {
      column: sort.id,
      direction: sort.desc ? "desc" : "asc",
    };
  }, [sorting]);

  // Handle sort toggle
  const handleSortToggle = (columnId: string) => {
    const current = sorting.find((s) => s.id === columnId);
    if (!current) {
      // Set to ascending
      setSorting([{ id: columnId, desc: false }]);
    } else if (!current.desc) {
      // Change to descending
      setSorting([{ id: columnId, desc: true }]);
    } else {
      // Clear sort
      setSorting([]);
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
        <div className="rounded-xl border border-muted-foreground/20 overflow-hidden bg-card/40 backdrop-blur-sm">
          <Table className="[&_table]:table-fixed">
            <TableHeader className="bg-muted/30 border-b border-muted-foreground/10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none"
                >
                  {headerGroup.headers
                    .filter(
                      (header) =>
                        header.column.id !== "select" &&
                        header.column.id !== "dragHandle" &&
                        header.column.getIsVisible()
                    )
                    .map((header) => {
                      const columnSize = header.column.getSize();
                      return (
                        <TableHead
                          key={header.id}
                          style={{
                            width: columnSize,
                            minWidth: columnSize,
                            maxWidth: columnSize,
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      );
                    })}
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
                    colSpan={columns.length}
                    className="h-24 text-center text-foreground/60 font-light"
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

  // Full variant with compact toolbar
  return (
    <div className="space-y-4">
      {/* Bulk Actions - show above table when rows are selected */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="mr-2 h-4 w-4" />
                Actions ({table.getFilteredSelectedRowModel().rows.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleBulkCopy();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Make a Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleBulkDelete();
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Compact Toolbar - sits directly above table */}
      <div className="flex items-center justify-end gap-2">
          {/* Filter Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[260px]">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Active Filters Display */}
              {(selectedStatusFilters.length > 0 ||
                dateRangeFilter.from ||
                dateRangeFilter.to ||
                fundingRangeFilter.min !== undefined ||
                fundingRangeFilter.max !== undefined) && (
                <>
                  <div className="px-2 py-1.5 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Active Filters:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedStatusFilters.map((status) => {
                        const filter = statusFilters.find((f) => f.value === status);
                        const statusKey = filter?.statuses[0] || status.toUpperCase();
                        return (
                          <Badge
                            key={status}
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            {formatStatus(statusKey)}
                            <button
                              type="button"
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStatusFilters((prev) =>
                                  prev.filter((s) => s !== status)
                                );
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                      {(dateRangeFilter.from || dateRangeFilter.to) && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          Date Range
                          <button
                            type="button"
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDateRangeFilter({
                                from: undefined,
                                to: undefined,
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {(fundingRangeFilter.min !== undefined ||
                        fundingRangeFilter.max !== undefined) && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          Funding Range
                          <button
                            type="button"
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFundingRangeFilter({
                                min: undefined,
                                max: undefined,
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Status Filters Section */}
              <div className="px-2 py-1.5">
                <Label className="text-xs font-medium mb-1.5 block">
                  Status
                </Label>
                <div className="space-y-0.5 max-h-[200px] overflow-y-auto pr-6">
                  {statusFilters.map((filter) => {
                    const count = statusCounts[filter.value] ?? 0;
                    const isSelected = selectedStatusFilters.includes(
                      filter.value
                    );
                    const statusKey = filter.statuses[0]; // Get the actual status key
                    const statusColorClass = getStatusVariant(statusKey);
                    return (
                      <div
                        key={filter.value}
                        className="flex items-center justify-between py-0.5"
                      >
                        <DropdownMenuCheckboxItem
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStatusFilters((prev) => [
                                ...prev,
                                filter.value,
                              ]);
                            } else {
                              setSelectedStatusFilters((prev) =>
                                prev.filter((s) => s !== filter.value)
                              );
                            }
                          }}
                          className="flex-1 min-w-0"
                        >
                          <Badge className={statusColorClass}>
                            {formatStatus(statusKey)}
                          </Badge>
                        </DropdownMenuCheckboxItem>
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Date Range Section */}
              <div className="px-2 py-1.5 space-y-2">
                <Label className="text-xs font-medium">Deadline Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1 min-w-0">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <DatePicker
                      date={dateRangeFilter.from}
                      onDateChange={(date) => {
                        setDateRangeFilter((prev) => ({
                          ...prev,
                          from: date,
                        }));
                      }}
                      placeholder="Start date"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <DatePicker
                      date={dateRangeFilter.to}
                      onDateChange={(date) => {
                        setDateRangeFilter((prev) => ({
                          ...prev,
                          to: date,
                        }));
                      }}
                      placeholder="End date"
                      className="bg-white"
                    />
                  </div>
                </div>
                {dateRangeFilter.from &&
                  dateRangeFilter.to &&
                  dateRangeFilter.from > dateRangeFilter.to && (
                    <p className="text-xs text-red-600">
                      Start date must be before end date
                    </p>
                  )}
              </div>

              <DropdownMenuSeparator />

              {/* Funding Amount Section */}
              <div className="px-2 py-1.5 space-y-2">
                <Label className="text-xs font-medium">Funding Amount</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      placeholder="Min"
                      value={
                        fundingRangeFilter.min !== undefined
                          ? fundingRangeFilter.min
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setFundingRangeFilter((prev) => ({
                          ...prev,
                          min: value ? Number(value) : undefined,
                        }));
                      }}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={
                        fundingRangeFilter.max !== undefined
                          ? fundingRangeFilter.max
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setFundingRangeFilter((prev) => ({
                          ...prev,
                          max: value ? Number(value) : undefined,
                        }));
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
                {fundingRangeFilter.min !== undefined &&
                  fundingRangeFilter.max !== undefined &&
                  fundingRangeFilter.min > fundingRangeFilter.max && (
                    <p className="text-xs text-red-600">
                      Min amount must be less than max amount
                    </p>
                  )}
              </div>

              <DropdownMenuSeparator />

              {/* Clear All Button */}
              <div className="px-2 py-2">
                <Button
                  variant="outline"
                  size="default"
                  className="w-full h-10 font-medium hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear all filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {currentSort
                  ? `${currentSort.column === "title" ? "Name" : currentSort.column === "lastEditedAt" ? "Last Edited" : currentSort.column === "createdAt" ? "Created At" : currentSort.column === "funding" ? "Funding" : currentSort.column === "deadline" ? "Deadline" : currentSort.column} ${
                      currentSort.direction === "asc" ? "↑" : "↓"
                    }`
                  : "Sort"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[
                { id: "title", label: "Application Name" },
                { id: "status", label: "Status" },
                { id: "funding", label: "Funding Amount" },
                { id: "deadline", label: "Deadline" },
                { id: "lastEditedAt", label: "Last Edited" },
                { id: "createdAt", label: "Created At" },
              ].map((column) => {
                const sortState = sorting.find((s) => s.id === column.id);
                const isAsc = sortState && !sortState.desc;
                const isDesc = sortState && sortState.desc;
                return (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortToggle(column.id);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{column.label}</span>
                    {isAsc && <ArrowUp className="h-4 w-4" />}
                    {isDesc && <ArrowDown className="h-4 w-4" />}
                    {!isAsc && !isDesc && <span className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
              {currentSort && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSorting([])}>
                    Clear sort
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={globalFilter ?? ""}
              onChange={(event) => {
                setGlobalFilter(event.target.value);
              }}
              className="w-[200px]"
              placeholder="Type to search..."
            />
          </div>

          {/* New Button */}
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={() => onNewApplication?.()}
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
      </div>

      {/* Table container */}
      <div className="rounded-md border">
        <Table className="w-full [&_table]:table-fixed">
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers
                      .filter(
                        (header) =>
                          header.column.getIsVisible() &&
                          header.column.id !== "dragHandle"
                      )
                      .map((header) => {
                        const columnSize = header.column.getSize();
                        return (
                          <TableHead
                            key={header.id}
                            style={{
                              width: columnSize,
                              minWidth: columnSize,
                              maxWidth: columnSize,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        );
                      })}
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
            </div>

          {/* Row count info */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} application(s)
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                ` · ${table.getFilteredSelectedRowModel().rows.length} selected`}
            </div>
          </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {applicationsToDelete.length > 0
                ? `Delete ${applicationsToDelete.length} Application${applicationsToDelete.length > 1 ? "s" : ""}`
                : "Delete Application"}
            </DialogTitle>
            <DialogDescription>
              {applicationsToDelete.length > 0 ? (
                <>
                  Are you sure you want to delete {applicationsToDelete.length}{" "}
                  application{applicationsToDelete.length > 1 ? "s" : ""}? This
                  action cannot be undone. Associated documents will also be
                  deleted.
                </>
              ) : (
                <>
                  Are you sure you want to delete &quot;
                  {applicationToDelete?.title || "this application"}&quot;? This
                  action cannot be undone. Associated documents will also be
                  deleted.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setApplicationsToDelete([]);
                setApplicationToDelete(null);
              }}
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
