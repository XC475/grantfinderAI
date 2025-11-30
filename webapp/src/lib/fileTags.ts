import {
  FileText,
  Award,
  Layout,
  Target,
  FileCheck,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FileSpreadsheet,
  Mail,
  Shield,
  Tag as TagIcon,
  LucideIcon,
} from "lucide-react";

// Default icons for common tag names
const TAG_ICON_MAP: Record<string, LucideIcon> = {
  General: FileText,
  "Winning Application": Award,
  "Winning Applications": Award,
  Template: Layout,
  Templates: Layout,
  "Grant Opportunities": Target,
  "Awards & Contracts": FileCheck,
  "Financials and Budget": DollarSign,
  "Budgets & Financial": DollarSign,
  "Progress Reports": TrendingUp,
  "Final Reports": CheckCircle,
  "Supporting Documents": FileSpreadsheet,
  Correspondence: Mail,
  "Compliance Records": Shield,
};

// Default descriptions for common tag names
const TAG_DESCRIPTION_MAP: Record<string, string> = {
  General: "General organizational documents and references",
  "Winning Application": "Past successful grant applications",
  "Winning Applications": "Past successful grant applications",
  Template: "Document templates and boilerplate content",
  Templates: "Document templates and boilerplate content",
  "Grant Opportunities": "RFPs, NOFOs, and grant opportunity announcements",
  "Awards & Contracts": "Award letters, executed contracts, and amendments",
  "Financials and Budget": "Budgets, expense reports, and financial records",
  "Budgets & Financial": "Budgets, expense reports, and financial records",
  "Progress Reports": "Interim and periodic narrative reports",
  "Final Reports": "Final reports, evaluations, and closeout documents",
  "Supporting Documents": "Data analyses, research, and supporting evidence",
  Correspondence: "Communications, letters, and regulatory correspondence",
  "Compliance Records":
    "Audit reports, compliance forms, and internal controls",
};

export interface DocumentTag {
  id: string;
  name: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function getFileTagLabel(tag: DocumentTag | string): string {
  if (typeof tag === "string") {
    return tag;
  }
  return tag.name;
}

export function getFileTagIcon(tag: DocumentTag | string): LucideIcon {
  const tagName = typeof tag === "string" ? tag : tag.name;
  return TAG_ICON_MAP[tagName] || TagIcon;
}

export function getFileTagDescription(tag: DocumentTag | string): string {
  const tagName = typeof tag === "string" ? tag : tag.name;
  return TAG_DESCRIPTION_MAP[tagName] || "";
}

// Helper to fetch all tags for an organization (client-side)
export async function getAllDocumentTags(): Promise<DocumentTag[]> {
  try {
    const response = await fetch("/api/document-tags");
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }
    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error("Error fetching document tags:", error);
    return [];
  }
}
