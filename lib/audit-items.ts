import type { BuildingAgeBand, FloodRiskZone } from "@prisma/client";
import type { AuditTemplateItem } from "@/types/audit-template";
import { isTextAnswerItem } from "@/types/audit-template";

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

export function isAuditItemApplicable(
  item: AuditTemplateItem,
  profile: ProfileForSections,
): boolean {
  if (!item.profileFlag) {
    return true;
  }
  return matchesProfileFlag(item.profileFlag, profile);
}

export function filterApplicableItems(
  items: AuditTemplateItem[],
  profile: ProfileForSections,
): AuditTemplateItem[] {
  return items.filter((item) => isAuditItemApplicable(item, profile));
}

export function isTextResponseComplete(
  item: AuditTemplateItem,
  notes: string | null | undefined,
): boolean {
  return isTextAnswerItem(item) && Boolean(notes?.trim());
}
