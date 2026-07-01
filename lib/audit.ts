import {
  ActionSourceType,
  ActionStatus,
  AuditSectionStatus,
  AuditStatus,
  Priority,
  ResponseValue,
  type Audit,
  type AuditResponse,
  type AuditSection,
  type PremisesProfile,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPremisesForOrganisation } from "@/lib/premises";
import { filterApplicableItems, isTextResponseComplete } from "@/lib/audit-items";
import type {
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
} from "@/types/audit-template";
import { isTextAnswerItem } from "@/types/audit-template";

export type AuditWithRelations = Audit & {
  sections: AuditSection[];
  responses: AuditResponse[];
  template: { version: string; sections: unknown };
  premises: {
    id: string;
    name: string;
    profile: PremisesProfile | null;
  };
};

export function parseTemplateSections(sections: unknown): AuditTemplateSections {
  return sections as AuditTemplateSections;
}

export async function getAuditForOrganisation(
  auditId: string,
  organisationId: string,
): Promise<AuditWithRelations | null> {
  return prisma.audit.findFirst({
    where: {
      id: auditId,
      premises: { organisationId },
    },
    include: {
      sections: { orderBy: { sectionId: "asc" } },
      responses: true,
      template: { select: { version: true, sections: true } },
      premises: {
        select: {
          id: true,
          name: true,
          profile: true,
        },
      },
    },
  }) as Promise<AuditWithRelations | null>;
}

export function getTemplateSection(
  templateSections: AuditTemplateSections,
  sectionId: string,
): AuditTemplateSection | undefined {
  return templateSections.find((section) => section.id === sectionId);
}

export function getApplicableItemsForSection(
  section: AuditTemplateSection,
  profile: PremisesProfile,
): AuditTemplateItem[] {
  return filterApplicableItems(section.items, profile);
}

export async function startOrResumeAudit(
  premisesId: string,
  organisationId: string,
  userId: string,
): Promise<{ audit: AuditWithRelations; created: boolean }> {
  const premises = await getPremisesForOrganisation(premisesId, organisationId);

  if (!premises) {
    throw new Error("Premises not found");
  }

  if (!premises.profile) {
    throw new Error("Complete the premises profile before starting an audit");
  }

  if (premises.profile.applicableSections.length === 0) {
    throw new Error("No audit sections apply to this premises profile");
  }

  const existingDraft = await prisma.audit.findFirst({
    where: {
      premisesId,
      status: AuditStatus.DRAFT,
    },
    include: {
      sections: { orderBy: { sectionId: "asc" } },
      responses: true,
      template: { select: { version: true, sections: true } },
      premises: {
        select: {
          id: true,
          name: true,
          profile: true,
        },
      },
    },
  });

  if (existingDraft) {
    return {
      audit: existingDraft as AuditWithRelations,
      created: false,
    };
  }

  const template = await prisma.auditTemplate.findFirst({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
  });

  if (!template) {
    throw new Error("No active audit template found");
  }

  const audit = await prisma.audit.create({
    data: {
      premisesId,
      templateId: template.id,
      status: AuditStatus.DRAFT,
      startedBy: userId,
      sections: {
        create: premises.profile.applicableSections.map((sectionId) => ({
          sectionId,
          status: AuditSectionStatus.NOT_STARTED,
        })),
      },
    },
    include: {
      sections: { orderBy: { sectionId: "asc" } },
      responses: true,
      template: { select: { version: true, sections: true } },
      premises: {
        select: {
          id: true,
          name: true,
          profile: true,
        },
      },
    },
  });

  return {
    audit: audit as AuditWithRelations,
    created: true,
  };
}

function isResponseComplete(
  response: AuditResponse,
  item?: AuditTemplateItem,
): boolean {
  if (item && isTextAnswerItem(item)) {
    return isTextResponseComplete(item, response.notes);
  }

  if (response.response === ResponseValue.YES) {
    return Boolean(response.notes?.trim());
  }
  if (
    response.response === ResponseValue.NO ||
    response.response === ResponseValue.NA
  ) {
    return true;
  }
  return response.response === ResponseValue.ACTION_NEEDED;
}

function countCompleteResponses(
  responses: AuditResponse[],
  items: AuditTemplateItem[],
): number {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  return responses.filter((response) => {
    const item = itemsById.get(response.itemId);
    return item ? isResponseComplete(response, item) : false;
  }).length;
}

async function refreshSectionStatus(
  auditId: string,
  sectionId: string,
  profile: PremisesProfile,
  templateSections: AuditTemplateSections,
): Promise<AuditSectionStatus> {
  const section = getTemplateSection(templateSections, sectionId);
  if (!section) {
    return AuditSectionStatus.SKIPPED;
  }

  const applicableItems = getApplicableItemsForSection(section, profile);

  if (applicableItems.length === 0) {
    await prisma.auditSection.updateMany({
      where: { auditId, sectionId },
      data: { status: AuditSectionStatus.SKIPPED },
    });
    return AuditSectionStatus.SKIPPED;
  }

  const responses = await prisma.auditResponse.findMany({
    where: {
      auditId,
      itemId: { in: applicableItems.map((item) => item.id) },
    },
  });

  const answeredCount = countCompleteResponses(responses, applicableItems);
  let status: AuditSectionStatus;

  if (answeredCount === 0) {
    status = AuditSectionStatus.NOT_STARTED;
  } else if (answeredCount < applicableItems.length) {
    status = AuditSectionStatus.IN_PROGRESS;
  } else {
    status = AuditSectionStatus.COMPLETE;
  }

  await prisma.auditSection.updateMany({
    where: { auditId, sectionId },
    data: { status },
  });

  return status;
}

export async function saveAuditResponse(
  auditId: string,
  organisationId: string,
  userId: string,
  itemId: string,
  sectionId: string,
  response: ResponseValue,
  options?: {
    notes?: string | null;
    needsAction?: boolean;
  },
): Promise<{
  response: AuditResponse;
  sectionStatus: AuditSectionStatus;
}> {
  const audit = await getAuditForOrganisation(auditId, organisationId);

  if (!audit) {
    throw new Error("Audit not found");
  }

  if (audit.status !== AuditStatus.DRAFT) {
    throw new Error("Cannot edit a completed audit");
  }

  const profile = audit.premises.profile;
  if (!profile) {
    throw new Error("Premises profile is required");
  }

  const templateSections = parseTemplateSections(audit.template.sections);
  const section = getTemplateSection(templateSections, sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  const applicableItems = getApplicableItemsForSection(section, profile);
  const item = applicableItems.find((entry) => entry.id === itemId);

  if (!item) {
    throw new Error("Question not found in this section");
  }

  let needsAction = options?.needsAction ?? false;
  let notes = options?.notes ?? null;
  let storedResponse = response;

  if (isTextAnswerItem(item)) {
    if (!notes?.trim()) {
      throw new Error("An answer is required");
    }
    storedResponse = ResponseValue.NA;
    needsAction = false;
  } else if (storedResponse === ResponseValue.YES && !notes?.trim()) {
    throw new Error("Provide details is required when answering Yes");
  } else if (
    needsAction &&
    storedResponse !== ResponseValue.YES &&
    storedResponse !== ResponseValue.NO
  ) {
    throw new Error("Needs action can only be set for Yes or No answers");
  }

  const saved = await prisma.auditResponse.upsert({
    where: {
      auditId_itemId: { auditId, itemId },
    },
    create: {
      auditId,
      itemId,
      response: storedResponse,
      needsAction,
      notes: notes?.trim() ? notes.trim() : null,
      respondedBy: userId,
    },
    update: {
      response: storedResponse,
      needsAction,
      notes: notes?.trim() ? notes.trim() : null,
      respondedBy: userId,
      respondedAt: new Date(),
    },
  });

  const sectionStatus = await refreshSectionStatus(
    auditId,
    sectionId,
    profile,
    templateSections,
  );

  return { response: saved, sectionStatus };
}

export type CreateAuditActionInput = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
  itemId: string;
  sectionId: string;
};

export async function createAuditAction(
  auditId: string,
  organisationId: string,
  userId: string,
  input: CreateAuditActionInput,
) {
  const audit = await getAuditForOrganisation(auditId, organisationId);

  if (!audit) {
    throw new Error("Audit not found");
  }

  const action = await prisma.action.create({
    data: {
      premisesId: audit.premisesId,
      title: input.title,
      description: input.description ?? null,
      sourceType: ActionSourceType.AUDIT,
      sourceRef: auditId,
      sourceItemId: input.itemId,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      status: ActionStatus.OPEN,
      createdBy: userId,
    },
  });

  const existing = await prisma.auditResponse.findUnique({
    where: {
      auditId_itemId: { auditId, itemId: input.itemId },
    },
  });

  const response =
    existing?.response === ResponseValue.YES ||
    existing?.response === ResponseValue.NO
      ? existing.response
      : ResponseValue.NO;

  await saveAuditResponse(
    auditId,
    organisationId,
    userId,
    input.itemId,
    input.sectionId,
    response,
    {
      notes: existing?.notes ?? input.description ?? null,
      needsAction: true,
    },
  );

  return action;
}

export function buildAuditSectionPayload(
  audit: AuditWithRelations,
  sectionId: string,
) {
  const profile = audit.premises.profile;
  if (!profile) {
    throw new Error("Premises profile is required");
  }

  const templateSections = parseTemplateSections(audit.template.sections);
  const section = getTemplateSection(templateSections, sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  const items = getApplicableItemsForSection(section, profile);
  const responsesByItemId = Object.fromEntries(
    audit.responses.map((response) => [response.itemId, response]),
  );

  const sectionRecord = audit.sections.find(
    (entry) => entry.sectionId === sectionId,
  );

  const actionItemIds = audit.responses
    .filter(
      (response) =>
        response.needsAction ||
        response.response === ResponseValue.ACTION_NEEDED,
    )
    .map((response) => response.itemId);

  return {
    section: {
      id: section.id,
      number: section.number,
      title: section.title,
      status: sectionRecord?.status ?? AuditSectionStatus.NOT_STARTED,
    },
    items: items.map((item) => ({
      ...item,
      response: responsesByItemId[item.id] ?? null,
    })),
    actionItemIds,
  };
}

export function buildAuditOverview(audit: AuditWithRelations) {
  const templateSections = parseTemplateSections(audit.template.sections);
  const profile = audit.premises.profile;

  const sections = audit.sections
    .map((sectionRecord) => {
      const templateSection = getTemplateSection(
        templateSections,
        sectionRecord.sectionId,
      );

      if (!templateSection || !profile) {
        return null;
      }

      const applicableItems = getApplicableItemsForSection(
        templateSection,
        profile,
      );
      const itemCount = applicableItems.length;
      const applicableIds = new Set(applicableItems.map((item) => item.id));
      const answeredCount = countCompleteResponses(
        audit.responses.filter((response) =>
          applicableIds.has(response.itemId),
        ),
        applicableItems,
      );

      return {
        id: sectionRecord.sectionId,
        number: templateSection.number,
        title: templateSection.title,
        status: sectionRecord.status,
        itemCount,
        answeredCount: Math.min(answeredCount, itemCount),
      };
    })
    .filter((section): section is NonNullable<typeof section> => section !== null)
    .sort((a, b) => a.number - b.number);

  const completedSections = sections.filter(
    (section) => section.status === AuditSectionStatus.COMPLETE,
  ).length;

  return {
    id: audit.id,
    status: audit.status,
    templateVersion: audit.template.version,
    premises: audit.premises,
    sections,
    progress: {
      completedSections,
      totalSections: sections.length,
    },
  };
}
