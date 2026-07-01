import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const template = await prisma.auditTemplate.findFirst({
      where: { isActive: true },
      orderBy: [{ publishedAt: "desc" }, { revision: "desc" }],
      select: { version: true, revision: true, publishedAt: true, sections: true },
    });

    const sections = Array.isArray(template?.sections)
      ? template.sections.length
      : 0;

    return NextResponse.json({
      data: {
        status: "ok",
        database: "connected",
        auditTemplate: template
          ? {
              version: template.version,
              revision: template.revision,
              sections,
            }
          : null,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error:
          error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 },
    );
  }
}
