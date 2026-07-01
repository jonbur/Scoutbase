import type { AuditSectionStatus, ResponseValue, ActionStatus, Priority } from "@prisma/client";
import type { AnswerableResponseType } from "@/types/audit-template";

export type AuditLinkedAction = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  status: ActionStatus;
};

export type AuditSectionSummary = {
  id: string;
  number: number;
  title: string;
  status: AuditSectionStatus;
  itemCount: number;
  answeredCount: number;
};

export type AuditOverview = {
  id: string;
  status: string;
  auditDate: string;
  templateVersion: string;
  templateRevision: number;
  templateLabel: string;
  premises: {
    id: string;
    name: string;
    profile: unknown;
  };
  sections: AuditSectionSummary[];
  progress: {
    completedSections: number;
    totalSections: number;
  };
};

export type AuditHistoryItem = {
  id: string;
  auditDate: string;
  status: string;
  templateLabel: string;
  startedAt: string;
  completedAt: string | null;
  progress: {
    completedSections: number;
    totalSections: number;
  };
};

export type AuditResponseRecord = {
  id: string;
  response: ResponseValue;
  needsAction: boolean;
  notes: string | null;
  recordedDate: string | null;
};

export type AuditItemWithResponse = {
  id: string;
  question: string;
  guidance: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
  response: AuditResponseRecord | null;
  actions: AuditLinkedAction[];
};

export type AuditSubQuestionWithResponse = {
  id: string;
  question: string;
  responseType: AnswerableResponseType;
  requiresDocument: boolean;
  documentType?: string;
  profileFlag?: string;
  response: AuditResponseRecord | null;
  actions: AuditLinkedAction[];
};

export type AuditAtomicSectionItem = {
  kind: "atomic";
  item: AuditItemWithResponse;
};

export type AuditGroupSectionItem = {
  kind: "group";
  id: string;
  label: string;
  guidance: string;
  subQuestions: AuditSubQuestionWithResponse[];
};

export type AuditSectionItem =
  | AuditAtomicSectionItem
  | AuditGroupSectionItem;

export type AuditSectionPayload = {
  section: {
    id: string;
    number: number;
    title: string;
    status: AuditSectionStatus;
  };
  items: AuditSectionItem[];
};

export const RESPONSE_LABELS: Record<ResponseValue, string> = {
  YES: "Yes",
  NO: "No",
  NA: "Not applicable",
  ACTION_NEEDED: "Needs action",
};

export const SECTION_STATUS_LABELS: Record<AuditSectionStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
  SKIPPED: "Skipped",
};
