import { NextResponse } from "next/server";
import { Priority } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import { createAuditAction, serializeLinkedAction } from "@/lib/audit";

type RouteParams = { params: { auditId: string } };

const VALID_PRIORITIES = new Set<string>(Object.values(Priority));

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const body = await request.json();

    const title = body?.title as string | undefined;
    const description = body?.description as string | undefined;
    const priority = body?.priority as string | undefined;
    const dueDate = body?.dueDate as string | null | undefined;
    const itemId = body?.itemId as string | undefined;

    if (!title || !priority || !itemId) {
      return NextResponse.json(
        {
          data: null,
          error: "title, priority, and itemId are required",
        },
        { status: 400 },
      );
    }

    if (!VALID_PRIORITIES.has(priority)) {
      return NextResponse.json(
        { data: null, error: "Invalid priority value" },
        { status: 400 },
      );
    }

    const action = await createAuditAction(
      params.auditId,
      auth.organisationId,
      auth.userId,
      {
        title,
        description,
        priority: priority as Priority,
        dueDate,
        itemId,
      },
    );

    return NextResponse.json({
      data: serializeLinkedAction(action),
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create action";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Audit not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
