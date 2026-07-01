import type { BuildingAgeBand, FloodRiskZone } from "@prisma/client";
import type {
  AnswerableAuditItem,
  AuditSubQuestion,
  AuditTemplateItem,
  AuditTemplateSections,
} from "@/types/audit-template";
import { isDateUploadItem, isGroupItem, isOpenTextItem } from "@/types/audit-template";

export type ProfileForSections = {
  buildingAgeBand: BuildingAgeBand;
  hasGas: boolean;
  hasSleeping: boolean;
  hasCateringKitchen: boolean;
  hasGrounds: boolean;
  hasVehicles: boolean;
  hasPlantMachinery: boolean;
  hasThirdPartyUsers: boolean;
  floodRiskZone: FloodRiskZone | null;
};

export function matchesProfileFlag(
  flag: string,
  profile: ProfileForSections,
): boolean {
  switch (flag) {
    case "hasGas":
      return profile.hasGas;
    case "hasSleeping":
      return profile.hasSleeping;
    case "hasCateringKitchen":
      return profile.hasCateringKitchen;
    case "hasGrounds":
      return profile.hasGrounds;
    case "hasVehicles":
      return profile.hasVehicles;
    case "hasPlantMachinery":
      return profile.hasPlantMachinery;
    case "hasThirdPartyUsers":
      return profile.hasThirdPartyUsers;
    case "hasPaidStaff":
      return false;
    case "floodRisk":
      return (
        profile.floodRiskZone === "MEDIUM" || profile.floodRiskZone === "HIGH"
      );
    default:
      return true;
  }
}

export function isSubQuestionApplicable(
  subQuestion: AuditSubQuestion,
  profile: ProfileForSections,
): boolean {
  if (!subQuestion.profileFlag) {
    return true;
  }
  return matchesProfileFlag(subQuestion.profileFlag, profile);
}

export function isAuditItemApplicable(
  item: AuditTemplateItem,
  profile: ProfileForSections,
): boolean {
  if (!item.profileFlag) {
    return true;
  }
  return matchesProfileFlag(item.profileFlag, profile);
}

export function filterApplicableSubQuestions(
  subQuestions: AuditSubQuestion[],
  profile: ProfileForSections,
): AuditSubQuestion[] {
  return subQuestions.filter((subQuestion) =>
    isSubQuestionApplicable(subQuestion, profile),
  );
}

export function filterApplicableItems(
  items: AuditTemplateItem[],
  profile: ProfileForSections,
): AuditTemplateItem[] {
  return items
    .filter((item) => isAuditItemApplicable(item, profile))
    .map((item) => {
      if (!isGroupItem(item)) {
        return item;
      }

      const subQuestions = filterApplicableSubQuestions(
        item.subQuestions,
        profile,
      );

      if (subQuestions.length === 0) {
        return null;
      }

      return {
        ...item,
        subQuestions,
      };
    })
    .filter((item): item is AuditTemplateItem => item !== null);
}

export function getAnswerableItems(
  items: AuditTemplateItem[],
): AnswerableAuditItem[] {
  const answerable: AnswerableAuditItem[] = [];

  for (const item of items) {
    if (isGroupItem(item)) {
      answerable.push(...item.subQuestions);
      continue;
    }

    answerable.push(item);
  }

  return answerable;
}

export function findAnswerableItem(
  items: AuditTemplateItem[],
  itemId: string,
): AnswerableAuditItem | undefined {
  return getAnswerableItems(items).find((item) => item.id === itemId);
}

export function findAnswerableItemInAudit(
  templateSections: AuditTemplateSections,
  profile: ProfileForSections,
  itemId: string,
  preferredSectionId?: string,
): { item: AnswerableAuditItem; sectionId: string } | undefined {
  const orderedSectionIds = preferredSectionId
    ? [
        preferredSectionId,
        ...templateSections
          .map((section) => section.id)
          .filter((id) => id !== preferredSectionId),
      ]
    : templateSections.map((section) => section.id);

  for (const sectionId of orderedSectionIds) {
    const section = templateSections.find((entry) => entry.id === sectionId);
    if (!section) {
      continue;
    }

    const item = findAnswerableItem(
      filterApplicableItems(section.items, profile),
      itemId,
    );

    if (item) {
      return { item, sectionId };
    }
  }

  return undefined;
}

export function isAnswerComplete(
  item: AnswerableAuditItem,
  notes: string | null | undefined,
  recordedDate: Date | string | null | undefined,
): boolean {
  if (isDateUploadItem(item)) {
    return Boolean(recordedDate);
  }

  if (isOpenTextItem(item)) {
    return Boolean(notes?.trim());
  }

  return false;
}

export function isTextResponseComplete(
  item: AnswerableAuditItem,
  notes: string | null | undefined,
  recordedDate?: Date | string | null,
): boolean {
  return isAnswerComplete(item, notes, recordedDate);
}
