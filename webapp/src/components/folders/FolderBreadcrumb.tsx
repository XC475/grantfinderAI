import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FolderPathItem {
  id: string;
  name: string;
  applicationId: string | null;
}

interface FolderBreadcrumbProps {
  folderPath: FolderPathItem[];
  rootLabel?: string;
  onNavigate: (folderId: string | null) => void;
  className?: string;
}

export function FolderBreadcrumb({
  folderPath,
  rootLabel = "Documents",
  onNavigate,
  className,
}: FolderBreadcrumbProps) {
  return (
    <div className={cn("flex items-center gap-1 min-w-0 flex-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(null)}
        className="h-auto p-0 hover:bg-transparent font-bold text-2xl truncate max-w-[200px]"
        title={rootLabel}
      >
        <span className="truncate">{rootLabel}</span>
      </Button>

      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(folder.id)}
            className={cn(
              "h-auto p-0 hover:bg-transparent text-base truncate max-w-[200px]",
              index === folderPath.length - 1
                ? "font-semibold"
                : "font-normal text-muted-foreground"
            )}
            title={folder.name}
          >
            <span className="truncate">{folder.name}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
