import type { ActionSourceType, ActionStatus, Priority } from "@prisma/client";

export type ActionListItem = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: ActionStatus;
  dueDate: string | null;
  sourceType: ActionSourceType | null;
  sourceItemId: string | null;
  sourceRef: string | null;
  createdAt: string;
  isOverdue: boolean;
};

export type ActionListFilters = {
  status: ActionStatus | "ALL";
  priority: Priority | "ALL";
  due: "all" | "overdue" | "upcoming" | "none";
  dueBefore: string;
  dueAfter: string;
};

export const DEFAULT_ACTION_FILTERS: ActionListFilters = {
  status: "ALL",
  priority: "ALL",
  due: "all",
  dueBefore: "",
  dueAfter: "",
};

export const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

export const ACTION_PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const ACTION_SOURCE_LABELS: Record<ActionSourceType, string> = {
  AUDIT: "Audit",
  RA: "Risk assessment",
  MANUAL: "Manual",
};
