import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth";
import {
  importAuditTemplateRelease,
  listAuditTemplateCatalog,
  listSelectableAuditTemplates,
} from "@/lib/audit-templates";
import { parseUploadedTemplatePayload } from "@/lib/audit-template-import";

export async function GET(request: Request) {
  try {
    await requireAuthContext();
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    const templates =
      mode === "selectable"
        ? await listSelectableAuditTemplates()
        : await listAuditTemplateCatalog();

    return NextResponse.json({ data: { templates }, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to load templates",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthContext();
    const body = await request.json();
    const input = parseUploadedTemplatePayload(body);

    const template = await importAuditTemplateRelease({
      version: input.version,
      publishedAt: input.publishedAt,
      description: input.description,
      sections: input.sections,
      setActive: input.setActive,
    });

    return NextResponse.json({ data: { template }, error: null }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import template";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("already exists") || message.includes("must")
          ? 400
          : 500;

    return NextResponse.json({ data: null, error: message }, { status });
  }
}
