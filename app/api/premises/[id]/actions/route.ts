import { NextResponse } from "next/server";
import { ActionStatus, Priority } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import {
  listPremisesActions,
  parseActionListFilters,
  serializeActionListItem,
} from "@/lib/actions";

type RouteParams = { params: { id: string } };

const VALID_STATUSES = new Set<string>(Object.values(ActionStatus));
const VALID_PRIORITIES = new Set<string>(Object.values(Priority));
const VALID_DUE = new Set(["all", "overdue", "upcoming", "none"]);

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const url = new URL(request.url);
    const filters = parseActionListFilters(
      Object.fromEntries(url.searchParams.entries()),
    );

    if (filters.status !== "ALL" && !VALID_STATUSES.has(filters.status)) {
      return NextResponse.json(
        { data: null, error: "Invalid status filter" },
        { status: 400 },
      );
    }

    if (filters.priority !== "ALL" && !VALID_PRIORITIES.has(filters.priority)) {
      return NextResponse.json(
        { data: null, error: "Invalid priority filter" },
        { status: 400 },
      );
    }

    if (!VALID_DUE.has(filters.due)) {
      return NextResponse.json(
        { data: null, error: "Invalid due date filter" },
        { status: 400 },
      );
    }

    const actions = await listPremisesActions(
      params.id,
      auth.organisationId,
      filters,
    );

    const openCount = actions.filter((action) => action.status === "OPEN").length;
    const inProgressCount = actions.filter(
      (action) => action.status === "IN_PROGRESS",
    ).length;
    const overdueCount = actions.filter((action) => action.isOverdue).length;

    return NextResponse.json({
      data: {
        actions,
        summary: {
          total: actions.length,
          open: openCount,
          inProgress: inProgressCount,
          overdue: overdueCount,
        },
      },
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load actions";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Premises not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
