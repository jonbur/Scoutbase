import {
  ActionSourceType,
  ActionStatus,
  AuditSectionStatus,
  AuditStatus,
  Priority,
  ResponseValue,
  type Action,
  type Audit,
  type AuditResponse,
  type AuditSection,
  type PremisesProfile,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPremisesForOrganisation } from "@/lib/premises";
import {
  filterApplicableItems,
  findAnswerableItemInAudit,
  getAnswerableItems,
  isAnswerComplete,
} from "@/lib/audit-items";
import { isInputDate, parseInputDate, toRecordedDateIso } from "@/lib/dates";
import { computeApplicableSections } from "@/lib/sections";
import type {
  AuditTemplateItem,
  AuditTemplateSection,
  AuditTemplateSections,
  AnswerableAuditItem,
} from "@/types/audit-template";
import { isDateUploadItem, isGroupItem, isOpenTextItem, isTextAnswerItem } from "@/types/audit-template";
import type { AuditLinkedAction } from "@/types/audit";

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

const auditWithRelationsInclude = {
  sections: { orderBy: { sectionId: "asc" as const } },
  responses: true,
  template: { select: { version: true, sections: true } },
  premises: {
    select: {
      id: true,
      name: true,
      profile: true,
    },
  },
};

async function fetchAuditWithRelations(
  auditId: string,
  organisationId: string,
): Promise<AuditWithRelations | null> {
  return prisma.audit.findFirst({
    where: {
      id: auditId,
      premises: { organisationId },
    },
    include: auditWithRelationsInclude,
  }) as Promise<AuditWithRelations | null>;
}

function applicableSectionsMatch(
  current: string[],
  target: string[],
): boolean {
  if (current.length !== target.length) {
    return false;
  }

  return current.every((sectionId, index) => sectionId === target[index]);
}

export async function syncDraftAudit(
  audit: AuditWithRelations,
): Promise<AuditWithRelations> {
  if (audit.status !== AuditStatus.DRAFT) {
    return audit;
  }

  const profile = audit.premises.profile;
  if (!profile) {
    return audit;
  }

  const activeTemplate = await prisma.auditTemplate.findFirst({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
  });

  if (!activeTemplate) {
    return audit;
  }

  const applicableSections = computeApplicableSections(profile);
  const currentSectionIds = new Set(
    audit.sections.map((section) => section.sectionId),
  );
  const sectionsToRemove = audit.sections
    .filter((section) => !applicableSections.includes(section.sectionId))
    .map((section) => section.sectionId);
  const sectionsToAdd = applicableSections.filter(
    (sectionId) => !currentSectionIds.has(sectionId),
  );
  const profileSectionsChanged = !applicableSectionsMatch(
    profile.applicableSections,
    applicableSections,
  );
  const needsTemplateUpdate = audit.templateId !== activeTemplate.id;

  if (
    !needsTemplateUpdate &&
    sectionsToRemove.length === 0 &&
    sectionsToAdd.length === 0 &&
    !profileSectionsChanged
  ) {
    return audit;
  }

  await prisma.$transaction(async (tx) => {
    if (profileSectionsChanged) {
      await tx.premisesProfile.update({
        where: { premisesId: audit.premisesId },
        data: { applicableSections },
      });
    }

    if (needsTemplateUpdate) {
      await tx.audit.update({
        where: { id: audit.id },
        data: { templateId: activeTemplate.id },
      });
    }

    if (sectionsToRemove.length > 0) {
      await tx.auditSection.deleteMany({
        where: {
          auditId: audit.id,
          sectionId: { in: sectionsToRemove },
        },
      });
    }

    if (sectionsToAdd.length > 0) {
      await tx.auditSection.createMany({
        data: sectionsToAdd.map((sectionId) => ({
          auditId: audit.id,
          sectionId,
          status: AuditSectionStatus.NOT_STARTED,
        })),
      });
    }
  });

  const refreshed = await prisma.audit.findUnique({
    where: { id: audit.id },
    include: auditWithRelationsInclude,
  });

  return (refreshed ?? audit) as AuditWithRelations;
}

export async function getAuditForOrganisation(
  auditId: string,
  organisationId: string,
): Promise<AuditWithRelations | null> {
  const audit = await fetchAuditWithRelations(auditId, organisationId);

  if (!audit) {
    return null;
  }

  if (audit.status === AuditStatus.DRAFT) {
    return syncDraftAudit(audit);
  }

  return audit;
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
    const audit = await syncDraftAudit(existingDraft as AuditWithRelations);

    return {
      audit,
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
  item?: AnswerableAuditItem,
): boolean {
  if (item && isTextAnswerItem(item)) {
    return isAnswerComplete(item, response.notes, response.recordedDate);
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
  items: AnswerableAuditItem[],
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
  const answerableItems = getAnswerableItems(applicableItems);

  if (answerableItems.length === 0) {
    await prisma.auditSection.updateMany({
      where: { auditId, sectionId },
      data: { status: AuditSectionStatus.SKIPPED },
    });
    return AuditSectionStatus.SKIPPED;
  }

  const responses = await prisma.auditResponse.findMany({
    where: {
      auditId,
      itemId: { in: answerableItems.map((item) => item.id) },
    },
  });

  const answeredCount = countCompleteResponses(responses, answerableItems);
  let status: AuditSectionStatus;

  if (answeredCount === 0) {
    status = AuditSectionStatus.NOT_STARTED;
  } else if (answeredCount < answerableItems.length) {
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
    recordedDate?: string | null;
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

  const located = findAnswerableItemInAudit(
    templateSections,
    profile,
    itemId,
    sectionId,
  );
  const item = located?.item;
  const resolvedSectionId = located?.sectionId ?? sectionId;

  if (!item) {
    throw new Error("Question not found in this section");
  }

  let needsAction = options?.needsAction ?? false;
  let notes = options?.notes ?? null;
  let recordedDate: Date | null = null;
  let storedResponse = response;

  if (isDateUploadItem(item)) {
    const dateValue = options?.recordedDate?.trim();
    if (!dateValue || !isInputDate(dateValue)) {
      throw new Error("A valid date is required");
    }
    storedResponse = ResponseValue.NA;
    needsAction = false;
    notes = null;
    recordedDate = parseInputDate(dateValue);
  } else if (isOpenTextItem(item)) {
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
      recordedDate,
      respondedBy: userId,
    },
    update: {
      response: storedResponse,
      needsAction,
      notes: notes?.trim() ? notes.trim() : null,
      recordedDate,
      respondedBy: userId,
      respondedAt: new Date(),
    },
  });

  const sectionStatus = await refreshSectionStatus(
    auditId,
    resolvedSectionId,
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

export function serializeLinkedAction(action: Action): AuditLinkedAction {
  return {
    id: action.id,
    title: action.title,
    description: action.description,
    priority: action.priority,
    dueDate: toRecordedDateIso(action.dueDate),
    status: action.status,
  };
}

async function getAuditActionsByItemId(
  auditId: string,
): Promise<Map<string, Action>> {
  const actions = await prisma.action.findMany({
    where: {
      sourceType: ActionSourceType.AUDIT,
      sourceRef: auditId,
      sourceItemId: { not: null },
    },
  });

  return new Map(
    actions
      .filter((action): action is Action & { sourceItemId: string } =>
        Boolean(action.sourceItemId),
      )
      .map((action) => [action.sourceItemId, action]),
  );
}

export type UpdateAuditActionInput = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string | null;
};

export async function updateAuditAction(
  actionId: string,
  organisationId: string,
  input: UpdateAuditActionInput,
): Promise<Action> {
  const existing = await prisma.action.findFirst({
    where: {
      id: actionId,
      premises: { organisationId },
    },
  });

  if (!existing) {
    throw new Error("Action not found");
  }

  return prisma.action.update({
    where: { id: actionId },
    data: {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
}

export async function buildAuditSectionPayload(
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
  const actionsByItemId = await getAuditActionsByItemId(audit.id);
  const responsesByItemId = Object.fromEntries(
    audit.responses.map((response) => [response.itemId, response]),
  );

  const sectionRecord = audit.sections.find(
    (entry) => entry.sectionId === sectionId,
  );

  const toResponseRecord = (itemId: string) => {
    const response = responsesByItemId[itemId];
    if (!response) return null;

    return {
      id: response.id,
      response: response.response,
      needsAction: response.needsAction,
      notes: response.notes,
      recordedDate: toRecordedDateIso(response.recordedDate),
    };
  };

  const toLinkedAction = (itemId: string): AuditLinkedAction | null => {
    const action = actionsByItemId.get(itemId);
    return action ? serializeLinkedAction(action) : null;
  };

  return {
    section: {
      id: section.id,
      number: section.number,
      title: section.title,
      status: sectionRecord?.status ?? AuditSectionStatus.NOT_STARTED,
    },
    items: items.map((item) => {
      if (isGroupItem(item)) {
        return {
          kind: "group" as const,
          id: item.id,
          label: item.label,
          guidance: item.guidance,
          subQuestions: item.subQuestions.map((subQuestion) => ({
            ...subQuestion,
            response: toResponseRecord(subQuestion.id),
            action: toLinkedAction(subQuestion.id),
          })),
        };
      }

      return {
        kind: "atomic" as const,
        item: {
          ...item,
          response: toResponseRecord(item.id),
          action: toLinkedAction(item.id),
        },
      };
    }),
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
      const answerableItems = getAnswerableItems(applicableItems);
      const itemCount = answerableItems.length;
      const applicableIds = new Set(answerableItems.map((item) => item.id));
      const answeredCount = countCompleteResponses(
        audit.responses.filter((response) =>
          applicableIds.has(response.itemId),
        ),
        answerableItems,
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
