import { Folder, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderIconProps {
  isApplicationFolder?: boolean;
  className?: string;
}

export function FolderIcon({ isApplicationFolder, className }: FolderIconProps) {
  return (
    <div className="relative">
      <Folder className={cn("h-4 w-4", className)} />
      {isApplicationFolder && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5">
          <FileText className="h-2 w-2 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

