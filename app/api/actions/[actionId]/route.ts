import { NextResponse } from "next/server";
import { Priority } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import { serializeLinkedAction, updateAuditAction, deleteAuditAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: { actionId: string } };

const VALID_PRIORITIES = new Set<string>(Object.values(Priority));

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();

    const action = await prisma.action.findFirst({
      where: {
        id: params.actionId,
        premises: { organisationId: auth.organisationId },
      },
    });

    if (!action) {
      return NextResponse.json(
        { data: null, error: "Action not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: serializeLinkedAction(action),
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

    const action = await updateAuditAction(params.actionId, auth.organisationId, {
      title,
      description,
      priority: priority as Priority,
      dueDate,
    });

    return NextResponse.json({
      data: serializeLinkedAction(action),
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
    await deleteAuditAction(params.actionId, auth.organisationId);

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
