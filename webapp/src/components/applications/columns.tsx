"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash,
  GripVertical,
} from "lucide-react";
import { StatusSelect } from "./StatusSelect";

export interface Application {
  id: string;
  opportunityId: number | null;
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  lastEditedAt: string;
  opportunityTitle: string | null;
  opportunityDescription: string | null;
  opportunityEligibility: string | null;
  opportunityAgency: string | null;
  opportunityCloseDate: string | null;
  opportunityTotalFunding: bigint | null;
  opportunityAwardMin: bigint | null;
  opportunityAwardMax: bigint | null;
  opportunityUrl: string | null;
  opportunityAttachments: Array<{
    url?: string;
    title?: string;
    description?: string;
  }> | null;
  organization: {
    slug: string;
    name: string;
  };
}

interface ColumnActions {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, title: string | null) => void;
  onStatusChange: (id: string, newStatus: string) => void;
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

export function createSimpleColumns(
  actions: ColumnActions
): ColumnDef<Application>[] {
  return [
    // Application Name Column (no sorting)
    {
      accessorKey: "title",
      header: "Application Name",
      cell: ({ row }) => {
        return (
          <div className="space-y-1 max-w-[200px]">
            <div className="font-medium truncate">
              {row.original.title ||
                row.original.opportunityTitle ||
                (row.original.opportunityId
                  ? `Grant #${row.original.opportunityId}`
                  : "Untitled Application")}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {row.original.opportunityId
                ? `Opportunity ID: ${row.original.opportunityId}`
                : "Outside Opportunity"}
            </div>
          </div>
        );
      },
      size: 200,
    },

    // Status Column (no sorting)
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const application = row.original;
        return (
          <StatusSelect
            currentStatus={application.status}
            applicationId={application.id}
            onStatusChange={actions.onStatusChange}
          />
        );
      },
      size: 120,
    },

    // Funding Amount Column (no sorting)
    {
      accessorKey: "funding",
      header: () => <div className="text-right">Funding Amount</div>,
      cell: ({ row }) => {
        const amount = row.original.opportunityTotalFunding;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount ? Number(amount) : null)}
          </div>
        );
      },
      size: 140,
    },

    // Deadline Column (no sorting)
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        const closeDate = row.original.opportunityCloseDate;
        if (!closeDate) {
          return <span className="text-muted-foreground">No deadline</span>;
        }
        return (
          <div>
            {new Date(closeDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 120,
    },

    // Actions Column (dropdown)
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const application = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onView(application.id);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onEdit(application.id);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onDuplicate(application.id);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onDelete(application.id, application.title);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableResizing: false,
      size: 50,
    },
  ];
}

export function createColumns(
  actions: ColumnActions
): ColumnDef<Application>[] {
  return [
    // Select Column (checkbox)
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },

    // Drag Handle Column (optional)
    {
      id: "dragHandle",
      header: "",
      cell: () => (
        <div className="cursor-move text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      ),
      enableSorting: false,
      size: 40,
    },

    // Application Name Column (primary)
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Application Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="space-y-1 max-w-[200px]">
            <div className="font-medium truncate">
              {row.original.title ||
                row.original.opportunityTitle ||
                (row.original.opportunityId
                  ? `Grant #${row.original.opportunityId}`
                  : "Untitled Application")}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {row.original.opportunityId
                ? `Opportunity ID: ${row.original.opportunityId}`
                : "Outside Opportunity"}
            </div>
          </div>
        );
      },
      size: 200,
    },

    // Status Column (badge)
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const application = row.original;
        return (
          <StatusSelect
            currentStatus={application.status}
            applicationId={application.id}
            onStatusChange={actions.onStatusChange}
          />
        );
      },
      size: 120,
    },

    // Funding Amount Column
    {
      accessorKey: "funding",
      header: ({ column }) => {
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-mr-4"
            >
              Funding Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.opportunityTotalFunding;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount ? Number(amount) : null)}
          </div>
        );
      },
      size: 140,
    },

    // Deadline Column
    {
      accessorKey: "deadline",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Deadline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const closeDate = row.original.opportunityCloseDate;
        if (!closeDate) {
          return <span className="text-muted-foreground">No deadline</span>;
        }
        return (
          <div>
            {new Date(closeDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 120,
    },

    // Last Edited Column
    {
      accessorKey: "lastEditedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Last Edited
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastEditedAt"));
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 120,
    },

    // Created At Column
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 120,
    },

    // Actions Column (dropdown)
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const application = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onView(application.id);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onEdit(application.id);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onDuplicate(application.id);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onDelete(application.id, application.title);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableResizing: false,
      size: 50,
    },
  ];
}
