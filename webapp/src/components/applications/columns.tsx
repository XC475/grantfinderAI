"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
  GripVertical 
} from "lucide-react";

export interface Application {
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

interface ColumnActions {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, title: string | null) => void;
}

function getStatusVariant(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-purple-100 text-purple-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "UNDER_REVIEW":
    case "SUBMITTED":
      return "bg-cyan-100 text-cyan-800";
    case "AWARDED":
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
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

export function createColumns(actions: ColumnActions): ColumnDef<Application>[] {
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
          <div className="space-y-1 max-w-[300px]">
            <div className="font-medium truncate">
              {row.original.title || `Grant #${row.original.opportunityId}`}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              Opportunity ID: {row.original.opportunityId}
            </div>
          </div>
        );
      },
      size: 300,
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
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusVariant(status)}>
            {formatStatus(status)}
          </Badge>
        );
      },
      size: 150,
    },

    // Funding Amount Column
    {
      accessorKey: "funding",
      header: ({ column }) => {
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-mr-4"
            >
              Funding Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = row.original.opportunity?.total_funding_amount;
        return (
          <div className="text-right font-medium">
            {formatCurrency(amount)}
          </div>
        );
      },
      size: 180,
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
        const closeDate = row.original.opportunity?.close_date;
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
      size: 150,
    },

    // Last Edited Column (hidden by default)
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
      size: 150,
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
      size: 60,
    },
  ];
}

