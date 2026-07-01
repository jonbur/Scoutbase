import {
  ActionStatus,
  type Action,
  type ActionSourceType,
  type ActionStatus as ActionStatusType,
  type Priority,
  type Prisma,
} from "@prisma/client";
import { getPremisesForOrganisation } from "@/lib/premises";
import { prisma } from "@/lib/prisma";
import { isInputDate, parseInputDate, toRecordedDateIso } from "@/lib/dates";
import type { ActionListFilters, ActionListItem } from "@/types/action";

export type UpdateActionInput = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
  status?: ActionStatusType;
};

function startOfTodayUtc(): Date {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
}

export function serializeActionListItem(action: Action): ActionListItem {
  const today = startOfTodayUtc();
  const isOverdue =
    action.status !== ActionStatus.RESOLVED &&
    Boolean(action.dueDate) &&
    action.dueDate! < today;

  return {
    id: action.id,
    title: action.title,
    description: action.description,
    priority: action.priority,
    status: action.status,
    dueDate: toRecordedDateIso(action.dueDate),
    sourceType: action.sourceType,
    sourceItemId: action.sourceItemId,
    sourceRef: action.sourceRef,
    createdAt: action.createdAt.toISOString(),
    isOverdue,
  };
}

function buildActionWhere(
  premisesId: string,
  filters: ActionListFilters,
): Prisma.ActionWhereInput {
  const where: Prisma.ActionWhereInput = { premisesId };
  const today = startOfTodayUtc();

  if (filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.priority !== "ALL") {
    where.priority = filters.priority;
  }

  const dueDateFilter: Prisma.DateTimeNullableFilter = {};
  let dueDateIsNull = false;

  if (filters.due === "overdue") {
    dueDateFilter.lt = today;
    if (filters.status === "ALL") {
      where.status = { not: ActionStatus.RESOLVED };
    }
  } else if (filters.due === "upcoming") {
    dueDateFilter.gte = today;
    if (filters.status === "ALL") {
      where.status = { not: ActionStatus.RESOLVED };
    }
  } else if (filters.due === "none") {
    dueDateIsNull = true;
    where.dueDate = null;
  }

  if (!dueDateIsNull) {
    if (filters.dueBefore && isInputDate(filters.dueBefore)) {
      dueDateFilter.lte = parseInputDate(filters.dueBefore)!;
    }

    if (filters.dueAfter && isInputDate(filters.dueAfter)) {
      dueDateFilter.gte = parseInputDate(filters.dueAfter)!;
    }

    if (Object.keys(dueDateFilter).length > 0) {
      where.dueDate = dueDateFilter;
    }
  }

  return where;
}

export async function listPremisesActions(
  premisesId: string,
  organisationId: string,
  filters: ActionListFilters,
): Promise<ActionListItem[]> {
  const premises = await getPremisesForOrganisation(premisesId, organisationId);

  if (!premises) {
    throw new Error("Premises not found");
  }

  const actions = await prisma.action.findMany({
    where: buildActionWhere(premisesId, filters),
    orderBy: [
      { status: "asc" },
      { dueDate: { sort: "asc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });

  return actions.map(serializeActionListItem);
}

export async function getActionForOrganisation(
  actionId: string,
  organisationId: string,
): Promise<Action | null> {
  return prisma.action.findFirst({
    where: {
      id: actionId,
      premises: { organisationId },
    },
  });
}

export async function updateAction(
  actionId: string,
  organisationId: string,
  input: UpdateActionInput,
): Promise<Action> {
  const existing = await getActionForOrganisation(actionId, organisationId);

  if (!existing) {
    throw new Error("Action not found");
  }

  const nextStatus = input.status ?? existing.status;
  const resolvedAt =
    nextStatus === ActionStatus.RESOLVED
      ? existing.resolvedAt ?? new Date()
      : null;

  return prisma.action.update({
    where: { id: actionId },
    data: {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      status: nextStatus,
      resolvedAt,
    },
  });
}

export async function deleteAction(
  actionId: string,
  organisationId: string,
): Promise<void> {
  const existing = await getActionForOrganisation(actionId, organisationId);

  if (!existing) {
    throw new Error("Action not found");
  }

  await prisma.action.delete({
    where: { id: actionId },
  });
}

export function parseActionListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ActionListFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value : "";
  };

  return {
    status: (get("status") || "ALL") as ActionListFilters["status"],
    priority: (get("priority") || "ALL") as ActionListFilters["priority"],
    due: (get("due") || "all") as ActionListFilters["due"],
    dueBefore: get("dueBefore"),
    dueAfter: get("dueAfter"),
  };
}

export function buildActionSourceLabel(
  sourceType: ActionSourceType | null,
): string {
  if (!sourceType) {
    return "Unknown";
  }

  switch (sourceType) {
    case "AUDIT":
      return "Audit";
    case "RA":
      return "Risk assessment";
    case "MANUAL":
      return "Manual";
    default:
      return sourceType;
  }
}
