import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth";
import { activateAuditTemplate } from "@/lib/audit-templates";

type RouteParams = { params: { templateId: string } };

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    await requireAuthContext();
    const template = await activateAuditTemplate(params.templateId);

    return NextResponse.json({ data: { template }, error: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to activate template";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Template not found"
          ? 404
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
