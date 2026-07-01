import { NextResponse } from "next/server";
import { ActionStatus, Priority } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import {
  deleteAction,
  serializeActionListItem,
  updateAction,
} from "@/lib/actions";

type RouteParams = { params: { actionId: string } };

const VALID_PRIORITIES = new Set<string>(Object.values(Priority));
const VALID_STATUSES = new Set<string>(Object.values(ActionStatus));

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const { getActionForOrganisation } = await import("@/lib/actions");
    const action = await getActionForOrganisation(
      params.actionId,
      auth.organisationId,
    );

    if (!action) {
      return NextResponse.json(
        { data: null, error: "Action not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: serializeActionListItem(action),
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load action";
    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const body = await request.json();

    const title = body?.title as string | undefined;
    const description = body?.description as string | undefined;
    const priority = body?.priority as string | undefined;
    const status = body?.status as string | undefined;
    const dueDate = body?.dueDate as string | null | undefined;

    if (!title || !priority) {
      return NextResponse.json(
        { data: null, error: "title and priority are required" },
        { status: 400 },
      );
    }

    if (!VALID_PRIORITIES.has(priority)) {
      return NextResponse.json(
        { data: null, error: "Invalid priority value" },
        { status: 400 },
      );
    }

    if (status && !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { data: null, error: "Invalid status value" },
        { status: 400 },
      );
    }

    const action = await updateAction(params.actionId, auth.organisationId, {
      title,
      description,
      priority: priority as Priority,
      dueDate,
      status: status as ActionStatus | undefined,
    });

    return NextResponse.json({
      data: serializeActionListItem(action),
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update action";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Action not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    await deleteAction(params.actionId, auth.organisationId);

    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete action";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Action not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
