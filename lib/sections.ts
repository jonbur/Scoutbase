import type { AuditTemplateSection, AuditTemplateSections } from "@/types/audit-template";
import { auditTemplate202509 } from "@/prisma/data/audit-template-normalized";
import { getActiveTemplateSections } from "@/lib/audit-templates";
import {
  matchesProfileFlag,
  type ProfileForSections,
} from "@/lib/audit-items";

export type { ProfileForSections };

export const AUDIT_SECTION_IDS = auditTemplate202509.map(
  (section) => section.id,
) as readonly string[];

export type AuditSectionId = (typeof AUDIT_SECTION_IDS)[number];

export async function getTemplateSectionsForProfile(): Promise<AuditTemplateSections> {
  return getActiveTemplateSections();
}

export function isLargerPremises(profile: ProfileForSections): boolean {
  return (
    profile.hasSleeping ||
    profile.hasCateringKitchen ||
    profile.hasGrounds ||
    profile.hasVehicles ||
    profile.hasPlantMachinery ||
    profile.hasThirdPartyUsers
  );
}

export function isSectionApplicable(
  section: AuditTemplateSection,
  profile: ProfileForSections,
): boolean {
  if (section.profileFlag && !matchesProfileFlag(section.profileFlag, profile)) {
    return false;
  }

  if (section.scope === "all") {
    if (section.id === "s7" && profile.buildingAgeBand === "POST_2000") {
      return false;
    }
    return true;
  }

  if (section.profileFlag) {
    return matchesProfileFlag(section.profileFlag, profile);
  }

  return isLargerPremises(profile);
}

export function computeApplicableSections(
  profile: ProfileForSections,
  sections: readonly AuditTemplateSection[] = auditTemplate202509,
): string[] {
  return sections
    .filter((section) => isSectionApplicable(section, profile))
    .map((section) => section.id);
}

export function countApplicableSections(profile: ProfileForSections): number {
  return computeApplicableSections(profile).length;
}

export function getSectionById(sectionId: string): AuditTemplateSection | undefined {
  return auditTemplate202509.find((section) => section.id === sectionId);
}
