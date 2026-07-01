import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth";
import {
  buildAuditSectionPayload,
  getAuditForOrganisation,
} from "@/lib/audit";

type RouteParams = {
  params: { auditId: string; sectionId: string };
};

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

    const payload = await buildAuditSectionPayload(audit, params.sectionId);

    return NextResponse.json({ data: payload, error: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load audit section";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Section not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
