"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const APPLICATION_STATUSES = [
  "DRAFT",
  "IN_PROGRESS",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "AWARDED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

interface StatusSelectProps {
  currentStatus: string;
  applicationId: string;
  onStatusChange?: (applicationId: string, newStatus: string) => void;
  disabled?: boolean;
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
    case "READY_TO_SUBMIT":
      return "bg-yellow-100 text-yellow-800";
    case "AWARDED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "WITHDRAWN":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function StatusSelect({
  currentStatus,
  applicationId,
  onStatusChange,
  disabled = false,
}: StatusSelectProps) {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(applicationId, newStatus);
    }
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={disabled}
    >
      <SelectTrigger
        onClick={(e) => e.stopPropagation()}
        className="w-fit border-0 shadow-none p-0 h-auto hover:bg-transparent focus:ring-0 focus:ring-offset-0"
      >
        <SelectValue asChild>
          <Badge className={getStatusVariant(currentStatus)}>
            {formatStatus(currentStatus)}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent onClick={(e) => e.stopPropagation()}>
        {APPLICATION_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <Badge className={getStatusVariant(status)}>
              {formatStatus(status)}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

