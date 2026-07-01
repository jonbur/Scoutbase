import type { PremisesProfile } from "@prisma/client";
import type { AuditTemplateItem } from "@/types/audit-template";

export function isAuditItemApplicable(
  item: AuditTemplateItem,
  profile: PremisesProfile,
): boolean {
  for (const tag of item.tags) {
    if (!tag.startsWith("profile:")) {
      continue;
    }

    const flag = tag.slice("profile:".length);

    switch (flag) {
      case "hasGas":
        if (!profile.hasGas) return false;
        break;
      case "hasSleeping":
        if (!profile.hasSleeping) return false;
        break;
      case "hasCateringKitchen":
        if (!profile.hasCateringKitchen) return false;
        break;
      case "hasGrounds":
        if (!profile.hasGrounds) return false;
        break;
      case "hasVehicles":
        if (!profile.hasVehicles) return false;
        break;
      case "hasPlantMachinery":
        if (!profile.hasPlantMachinery) return false;
        break;
      case "hasThirdPartyUsers":
        if (!profile.hasThirdPartyUsers) return false;
        break;
      case "buildingAgeBand":
        if (profile.buildingAgeBand === "POST_2000") return false;
        break;
      case "floodRiskZone":
        if (!profile.floodRiskZone || profile.floodRiskZone === "LOW") {
          return false;
        }
        break;
      default:
        break;
    }
  }

  return true;
}

export function filterApplicableItems(
  items: AuditTemplateItem[],
  profile: PremisesProfile,
): AuditTemplateItem[] {
  return items.filter((item) => isAuditItemApplicable(item, profile));
}
