import { FileCategory } from "@/generated/prisma";
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
  LucideIcon,
} from "lucide-react";

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  GENERAL: "General",
  WINNING_APPLICATION: "Winning Applications",
  TEMPLATE: "Templates",
  OPPORTUNITY: "Grant Opportunities",
  AWARD_CONTRACT: "Awards & Contracts",
  BUDGET_FINANCIAL: "Budgets & Financial",
  PROGRESS_REPORT: "Progress Reports",
  FINAL_REPORT: "Final Reports",
  SUPPORTING_DOCUMENT: "Supporting Documents",
  CORRESPONDENCE: "Correspondence",
  COMPLIANCE_RECORDS: "Compliance Records",
};

export const FILE_CATEGORY_ICONS: Record<FileCategory, LucideIcon> = {
  GENERAL: FileText,
  WINNING_APPLICATION: Award,
  TEMPLATE: Layout,
  OPPORTUNITY: Target,
  AWARD_CONTRACT: FileCheck,
  BUDGET_FINANCIAL: DollarSign,
  PROGRESS_REPORT: TrendingUp,
  FINAL_REPORT: CheckCircle,
  SUPPORTING_DOCUMENT: FileSpreadsheet,
  CORRESPONDENCE: Mail,
  COMPLIANCE_RECORDS: Shield,
};

export const FILE_CATEGORY_DESCRIPTIONS: Record<FileCategory, string> = {
  GENERAL: "General organizational documents and references",
  WINNING_APPLICATION: "Past successful grant applications",
  TEMPLATE: "Document templates and boilerplate content",
  OPPORTUNITY: "RFPs, NOFOs, and grant opportunity announcements",
  AWARD_CONTRACT: "Award letters, executed contracts, and amendments",
  BUDGET_FINANCIAL: "Budgets, expense reports, and financial records",
  PROGRESS_REPORT: "Interim and periodic narrative reports",
  FINAL_REPORT: "Final reports, evaluations, and closeout documents",
  SUPPORTING_DOCUMENT: "Data analyses, research, and supporting evidence",
  CORRESPONDENCE: "Communications, letters, and regulatory correspondence",
  COMPLIANCE_RECORDS: "Audit reports, compliance forms, and internal controls",
};

export function getFileCategoryLabel(type: FileCategory): string {
  return FILE_CATEGORY_LABELS[type] || type;
}

export function getFileCategoryIcon(type: FileCategory): LucideIcon {
  return FILE_CATEGORY_ICONS[type] || FileText;
}

export function getFileCategoryDescription(type: FileCategory): string {
  return FILE_CATEGORY_DESCRIPTIONS[type] || "";
}

export function getAllFileCategories(): FileCategory[] {
  return Object.values(FileCategory);
}

export function getKnowledgeBaseFileCategories(): FileCategory[] {
  // Returns all file categories for KB selection
  return getAllFileCategories();
}
