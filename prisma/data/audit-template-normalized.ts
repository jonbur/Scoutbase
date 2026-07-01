import type {
  AuditSubQuestion,
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
  AnswerableResponseType,
} from "@/types/audit-template";
import { AUDIT_TEMPLATE_V2025_09 } from "./audit-template-2025-09";

type RawSubQuestion = {
  id: string;
  question: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
};

type RawItem = {
  id: string;
  question?: string;
  label?: string;
  guidance: string | null;
  responseType: AuditTemplateItem["responseType"];
  requiresDocument: boolean;
  profileFlag?: string;
  documentType?: string;
  subQuestions?: readonly RawSubQuestion[];
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

function normalizeSubQuestion(item: RawSubQuestion): AuditSubQuestion {
  return {
    id: item.id,
    question: item.question,
    responseType: item.responseType,
    requiresDocument: item.requiresDocument,
    documentType: item.documentType,
    profileFlag: item.profileFlag,
  };
}

function normalizeItem(item: RawItem): AuditTemplateItem {
  if (item.responseType === "GROUP") {
    return {
      id: item.id,
      label: item.label ?? item.question ?? "",
      guidance: item.guidance ?? "",
      responseType: "GROUP",
      requiresDocument: false,
      profileFlag: item.profileFlag,
      subQuestions: (item.subQuestions ?? []).map(normalizeSubQuestion),
    };
  }

  return {
    id: item.id,
    question: item.question ?? "",
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
