import { NextResponse } from "next/server";
import { ResponseValue } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import { saveAuditResponse } from "@/lib/audit";

type RouteParams = { params: { auditId: string } };

const VALID_RESPONSES = new Set<string>([
  ResponseValue.YES,
  ResponseValue.NO,
  ResponseValue.NA,
]);

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const body = await request.json();

    const itemId = body?.itemId as string | undefined;
    const sectionId = body?.sectionId as string | undefined;
    const response = body?.response as string | undefined;
    const notes = body?.notes as string | null | undefined;
    const needsAction = Boolean(body?.needsAction);

    if (!itemId || !sectionId || !response) {
      return NextResponse.json(
        { data: null, error: "itemId, sectionId, and response are required" },
        { status: 400 },
      );
    }

    if (!VALID_RESPONSES.has(response)) {
      return NextResponse.json(
        { data: null, error: "Invalid response value" },
        { status: 400 },
      );
    }

    const result = await saveAuditResponse(
      params.auditId,
      auth.organisationId,
      auth.userId,
      itemId,
      sectionId,
      response as ResponseValue,
      { notes, needsAction },
    );

    return NextResponse.json({
      data: {
        response: result.response,
        sectionStatus: result.sectionStatus,
      },
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save response";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Audit not found" || message === "Question not found in this section"
          ? 404
          : message === "Cannot edit a completed audit" ||
              message.includes("required") ||
              message.includes("Needs action")
            ? 400
            : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
