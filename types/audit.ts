import type { AuditSectionStatus, ResponseValue } from "@prisma/client";

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
  templateVersion: string;
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

export type AuditItemWithResponse = {
  id: string;
  question: string;
  guidance: string;
  responseType: "yes_no_na" | "yes_no_na_action";
  tags: string[];
  response: {
    id: string;
    response: ResponseValue;
    notes: string | null;
  } | null;
};

export type AuditSectionPayload = {
  section: {
    id: string;
    number: number;
    title: string;
    status: AuditSectionStatus;
  };
  items: AuditItemWithResponse[];
  actionItemIds: string[];
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
