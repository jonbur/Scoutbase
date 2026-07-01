import type { BuildingAgeBand, FloodRiskZone } from "@prisma/client";

/** Section IDs aligned with SA Safe Scouting Premises Audit Tool (September 2025). */
export const AUDIT_SECTION_IDS = [
  "organisation-safety",
  "monitoring-incidents",
  "fire",
  "emergency-procedures",
  "electrical",
  "gas",
  "asbestos",
  "water-legionella",
  "third-parties",
  "access",
  "coshh",
  "equipment",
  "flood-risk",
  "staff-volunteers",
  "guests-visitors",
  "first-aid",
  "contractor-management",
  "safeguarding",
  "manual-handling",
  "catering",
  "sleeping-accommodation",
  "plant-machinery",
  "vehicles",
  "ppe",
  "trees-grounds",
] as const;

export type AuditSectionId = (typeof AUDIT_SECTION_IDS)[number];

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

function isSectionApplicable(
  sectionId: AuditSectionId,
  profile: ProfileForSections,
): boolean {
  switch (sectionId) {
    case "organisation-safety":
    case "monitoring-incidents":
    case "fire":
    case "emergency-procedures":
    case "electrical":
    case "water-legionella":
    case "third-parties":
    case "access":
    case "coshh":
    case "equipment":
    case "flood-risk":
    case "safeguarding":
      return true;
    case "gas":
      return profile.hasGas;
    case "asbestos":
      return profile.buildingAgeBand !== "POST_2000";
    case "staff-volunteers":
    case "first-aid":
    case "manual-handling":
      return isLargerPremises(profile);
    case "guests-visitors":
      return profile.hasThirdPartyUsers || profile.hasSleeping;
    case "contractor-management":
      return profile.hasThirdPartyUsers || isLargerPremises(profile);
    case "catering":
      return profile.hasCateringKitchen;
    case "sleeping-accommodation":
      return profile.hasSleeping;
    case "plant-machinery":
      return profile.hasPlantMachinery;
    case "vehicles":
      return profile.hasVehicles;
    case "ppe":
      return (
        isLargerPremises(profile) &&
        (profile.hasPlantMachinery || profile.hasCateringKitchen)
      );
    case "trees-grounds":
      return profile.hasGrounds;
    default:
      return true;
  }
}

export function computeApplicableSections(
  profile: ProfileForSections,
  sectionIds: readonly string[] = AUDIT_SECTION_IDS,
): string[] {
  return sectionIds.filter((id) =>
    isSectionApplicable(id as AuditSectionId, profile),
  );
}

export function countApplicableSections(profile: ProfileForSections): number {
  return computeApplicableSections(profile).length;
}
