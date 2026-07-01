import { NextResponse } from "next/server";
import { AuditStatus } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import {
  buildAuditOverview,
  listPremisesAudits,
  startNewAnnualAudit,
  startOrResumeAudit,
} from "@/lib/audit";
import {
  currentAuditYear,
  getActiveAuditTemplateSummary,
} from "@/lib/audit-templates";
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

    const [draft, audits, activeTemplate] = await Promise.all([
      prisma.audit.findFirst({
        where: {
          premisesId: params.id,
          status: AuditStatus.DRAFT,
        },
        select: { id: true, startedAt: true, auditYear: true },
      }),
      listPremisesAudits(params.id, auth.organisationId),
      getActiveAuditTemplateSummary(),
    ]);

    const currentYear = currentAuditYear();
    const canStartNewAudit =
      !draft && !audits.some((audit) => audit.auditYear === currentYear);

    return NextResponse.json({
      data: {
        hasProfile: Boolean(premises.profile),
        draftAudit: draft,
        audits,
        activeTemplate,
        currentAuditYear: currentYear,
        canStartNewAudit,
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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const body = await request.json().catch(() => ({}));
    const action =
      body && typeof body === "object" && "action" in body
        ? String((body as { action?: string }).action)
        : "resume";

    if (action === "start") {
      const auditYear =
        body &&
        typeof body === "object" &&
        typeof (body as { auditYear?: unknown }).auditYear === "number"
          ? (body as { auditYear: number }).auditYear
          : currentAuditYear();

      const { audit, created } = await startNewAnnualAudit(
        params.id,
        auth.organisationId,
        auth.userId,
        auditYear,
      );

      return NextResponse.json({
        data: {
          auditId: audit.id,
          created,
          overview: buildAuditOverview(audit),
        },
        error: null,
      });
    }

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
          : message.includes("profile") ||
              message.includes("sections") ||
              message.includes("already exists") ||
              message.includes("draft audit")
            ? 400
            : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
