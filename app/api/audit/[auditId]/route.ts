import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth";
import { buildAuditOverview, completeAudit, getAuditForOrganisation } from "@/lib/audit";

type RouteParams = { params: { auditId: string } };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const audit = await getAuditForOrganisation(params.auditId, auth.organisationId);

    if (!audit) {
      return NextResponse.json(
        { data: null, error: "Audit not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: buildAuditOverview(audit),
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Failed to load audit",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const audit = await completeAudit(params.auditId, auth.organisationId);

    return NextResponse.json({
      data: buildAuditOverview(audit),
      error: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to complete audit";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Audit not found"
          ? 404
          : message.includes("Complete all sections") ||
              message.includes("Only draft")
            ? 400
            : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
