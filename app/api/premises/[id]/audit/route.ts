import { NextResponse } from "next/server";
import { AuditStatus } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import { buildAuditOverview, startOrResumeAudit } from "@/lib/audit";
import { getPremisesForOrganisation } from "@/lib/premises";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const premises = await getPremisesForOrganisation(
      params.id,
      auth.organisationId,
    );

    if (!premises) {
      return NextResponse.json(
        { data: null, error: "Premises not found" },
        { status: 404 },
      );
    }

    const draft = await prisma.audit.findFirst({
      where: {
        premisesId: params.id,
        status: AuditStatus.DRAFT,
      },
      select: { id: true, startedAt: true },
    });

    return NextResponse.json({
      data: {
        hasProfile: Boolean(premises.profile),
        draftAudit: draft,
      },
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
    const { audit, created } = await startOrResumeAudit(
      params.id,
      auth.organisationId,
      auth.userId,
    );

    return NextResponse.json({
      data: {
        auditId: audit.id,
        created,
        overview: buildAuditOverview(audit),
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start audit";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Premises not found"
          ? 404
          : message.includes("profile") || message.includes("sections")
            ? 400
            : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
