import type {
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
} from "@/types/audit-template";
import { AUDIT_TEMPLATE_V2025_09 } from "./audit-template-2025-09";

type RawItem = {
  id: string;
  question: string;
  guidance: string | null;
  responseType: AuditTemplateItem["responseType"];
  requiresDocument: boolean;
  profileFlag?: string;
  documentType?: string;
};

type RawSubsection = {
  id: string;
  title: string;
  items: readonly RawItem[];
};

type RawSection = {
  id: string;
  number: number;
  title: string;
  scope: "ALL" | "EXTENDED";
  profileFlag?: string;
  items: readonly RawItem[];
  subsections?: readonly RawSubsection[];
};

function normalizeItem(item: RawItem): AuditTemplateItem {
  return {
    id: item.id,
    question: item.question,
    guidance: item.guidance ?? "",
    responseType: item.responseType,
    requiresDocument: item.requiresDocument,
    documentType: item.documentType,
    profileFlag: item.profileFlag,
  };
}

function flattenSection(section: RawSection): AuditTemplateSection {
  const items = section.subsections
    ? section.subsections.flatMap((subsection) => subsection.items)
    : section.items;

  return {
    id: section.id,
    number: section.number,
    title: section.title,
    scope: section.scope === "ALL" ? "all" : "extended",
    profileFlag: section.profileFlag,
    items: items.map(normalizeItem),
  };
}

/** Normalized sections for seeding and runtime use. */
export const auditTemplate202509: AuditTemplateSections = (
  AUDIT_TEMPLATE_V2025_09.sections as readonly RawSection[]
).map(flattenSection);

export const AUDIT_TEMPLATE_VERSION = AUDIT_TEMPLATE_V2025_09.version;
export const AUDIT_TEMPLATE_PUBLISHED_AT = AUDIT_TEMPLATE_V2025_09.publishedAt;
