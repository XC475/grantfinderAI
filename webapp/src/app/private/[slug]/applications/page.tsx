"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, FileText } from "lucide-react";
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

export default function ApplicationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `/api/applications?organizationSlug=${slug}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        toast.error("Failed to load applications");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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
  ];

  const table = useReactTable({
    data: applications,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeDirection: "ltr",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="container max-w-6xl py-8 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage your grant applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by browsing grants and clicking &ldquo;Apply&rdquo; to
                create your first application
              </p>
              <Button onClick={() => router.push(`/private/${slug}/grants`)}>
                Browse Grants
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Applications</h1>
        <p className="text-muted-foreground">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </div>

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
                    className="cursor-pointer"
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
      </div>
    </div>
  );
}
