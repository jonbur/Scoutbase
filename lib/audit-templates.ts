import type { Audit, AuditTemplate, AuditTemplateChangeType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateTemplateSections } from "@/lib/audit-template-import";
import type { AuditTemplateSections } from "@/types/audit-template";
import {
  formatAuditTemplateVersion,
  formatAuditTemplateVersionLong,
} from "@/types/audit-template-version";

export type AuditTemplateSummary = {
  id: string;
  version: string;
  revision: number;
  changeType: AuditTemplateChangeType;
  description: string | null;
  publishedAt: string;
  isActive: boolean;
  label: string;
  longLabel: string;
};

export type AuditWithTemplateFields = {
  status: Audit["status"];
  sectionsSnapshot?: unknown | null;
  template: {
    version: string;
    revision: number;
    changeType: AuditTemplateChangeType;
    sections: unknown;
  };
};

function toTemplateSummary(template: AuditTemplate): AuditTemplateSummary {
  return {
    id: template.id,
    version: template.version,
    revision: template.revision,
    changeType: template.changeType,
    description: template.description,
    publishedAt: template.publishedAt.toISOString(),
    isActive: template.isActive,
    label: formatAuditTemplateVersion(template),
    longLabel: formatAuditTemplateVersionLong(template),
  };
}

export function parseTemplateSections(sections: unknown): AuditTemplateSections {
  return sections as AuditTemplateSections;
}

export function getAuditTemplateSections(
  audit: AuditWithTemplateFields,
): AuditTemplateSections {
  if (audit.status === "COMPLETE" && audit.sectionsSnapshot) {
    return parseTemplateSections(audit.sectionsSnapshot);
  }

  return parseTemplateSections(audit.template.sections);
}

export function collectAnswerableItemIds(
  sections: AuditTemplateSections,
): Set<string> {
  const itemIds = new Set<string>();

  for (const section of sections) {
    for (const item of section.items) {
      if (item.responseType === "GROUP") {
        for (const subQuestion of item.subQuestions) {
          itemIds.add(subQuestion.id);
        }
      } else {
        itemIds.add(item.id);
      }
    }
  }

  return itemIds;
}

export async function getActiveAuditTemplate(): Promise<AuditTemplate | null> {
  return prisma.auditTemplate.findFirst({
    where: { isActive: true },
    orderBy: [{ publishedAt: "desc" }, { revision: "desc" }],
  });
}

export async function getActiveAuditTemplateSummary(): Promise<AuditTemplateSummary | null> {
  const template = await getActiveAuditTemplate();
  return template ? toTemplateSummary(template) : null;
}

export async function getLatestRevisionForVersion(
  version: string,
): Promise<AuditTemplate | null> {
  return prisma.auditTemplate.findFirst({
    where: { version },
    orderBy: { revision: "desc" },
  });
}

export async function getActiveTemplateSections(): Promise<AuditTemplateSections> {
  const template = await getActiveAuditTemplate();

  if (!template) {
    const { auditTemplate202509 } = await import(
      "@/prisma/data/audit-template-normalized"
    );
    return auditTemplate202509;
  }

  return parseTemplateSections(template.sections);
}

export async function publishTemplatePatch(input: {
  version: string;
  sections: AuditTemplateSections;
  description?: string;
  inPlace?: boolean;
}): Promise<AuditTemplate> {
  const latest = await getLatestRevisionForVersion(input.version);

  if (!latest) {
    throw new Error(`Template version ${input.version} not found`);
  }

  if (input.inPlace) {
    return prisma.auditTemplate.update({
      where: { id: latest.id },
      data: {
        sections: input.sections,
        changeType: "PATCH",
        description: input.description ?? latest.description,
      },
    });
  }

  const nextRevision = latest.revision + 1;

  return prisma.$transaction(async (tx) => {
    await tx.auditTemplate.update({
      where: { id: latest.id },
      data: { supersededAt: new Date() },
    });

    return tx.auditTemplate.create({
      data: {
        version: input.version,
        revision: nextRevision,
        changeType: "PATCH",
        description: input.description ?? null,
        publishedAt: new Date(),
        sections: input.sections,
        isActive: latest.isActive,
      },
    });
  });
}

export async function publishTemplateRelease(input: {
  version: string;
  publishedAt: Date;
  sections: AuditTemplateSections;
  description?: string;
}): Promise<AuditTemplate> {
  return prisma.$transaction(async (tx) => {
    await tx.auditTemplate.updateMany({
      where: { isActive: true },
      data: {
        isActive: false,
        supersededAt: new Date(),
      },
    });

    return tx.auditTemplate.create({
      data: {
        version: input.version,
        revision: 1,
        changeType: "RELEASE",
        description: input.description ?? null,
        publishedAt: input.publishedAt,
        sections: input.sections,
        isActive: true,
      },
    });
  });
}

export type AuditTemplateCatalogItem = AuditTemplateSummary & {
  sectionCount: number;
  auditCount: number;
  supersededAt: string | null;
};

function countSectionsInTemplate(sections: unknown): number {
  return Array.isArray(sections) ? sections.length : 0;
}

export async function listAuditTemplateCatalog(): Promise<AuditTemplateCatalogItem[]> {
  const templates = await prisma.auditTemplate.findMany({
    orderBy: [{ version: "desc" }, { revision: "desc" }],
    include: {
      _count: { select: { audits: true } },
    },
  });

  return templates.map((template) => ({
    ...toTemplateSummary(template),
    sectionCount: countSectionsInTemplate(template.sections),
    auditCount: template._count.audits,
    supersededAt: template.supersededAt?.toISOString() ?? null,
  }));
}

export async function listSelectableAuditTemplates(): Promise<AuditTemplateSummary[]> {
  const templates = await prisma.auditTemplate.findMany({
    orderBy: [{ version: "desc" }, { revision: "desc" }],
  });

  const latestByVersion = new Map<string, AuditTemplate>();

  for (const template of templates) {
    if (!latestByVersion.has(template.version)) {
      latestByVersion.set(template.version, template);
    }
  }

  return Array.from(latestByVersion.values()).map(toTemplateSummary);
}

export async function getAuditTemplateById(
  templateId: string,
): Promise<AuditTemplate | null> {
  return prisma.auditTemplate.findUnique({
    where: { id: templateId },
  });
}

export async function activateAuditTemplate(
  templateId: string,
): Promise<AuditTemplateSummary> {
  const template = await prisma.auditTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.auditTemplate.updateMany({
      where: { isActive: true },
      data: {
        isActive: false,
        supersededAt: new Date(),
      },
    });

    return tx.auditTemplate.update({
      where: { id: templateId },
      data: {
        isActive: true,
        supersededAt: null,
      },
    });
  });

  return toTemplateSummary(updated);
}

export async function importAuditTemplateRelease(input: {
  version: string;
  publishedAt: Date;
  sections: AuditTemplateSections;
  description?: string | null;
  setActive?: boolean;
}): Promise<AuditTemplateSummary> {
  const validationError = validateTemplateSections(input.sections);
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await getLatestRevisionForVersion(input.version);
  if (existing) {
    throw new Error(
      `Template version ${input.version} already exists. Publish a patch instead.`,
    );
  }

  const template = input.setActive === false
    ? await prisma.auditTemplate.create({
        data: {
          version: input.version,
          revision: 1,
          changeType: "RELEASE",
          description: input.description ?? null,
          publishedAt: input.publishedAt,
          sections: input.sections,
          isActive: false,
        },
      })
    : (
        await publishTemplateRelease({
          version: input.version,
          publishedAt: input.publishedAt,
          sections: input.sections,
          description: input.description ?? undefined,
        })
      );

  return toTemplateSummary(template);
}

export function defaultAuditDate(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}
