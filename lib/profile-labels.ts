import type {
  BuildingAgeBand,
  FloodRiskZone,
  OwnershipType,
} from "@prisma/client";

export const OWNERSHIP_LABELS: Record<OwnershipType, string> = {
  OWNED: "We own the building",
  LEASED: "We hold a long lease",
  HIRED: "We hire or share the premises",
};

export const BUILDING_AGE_LABELS: Record<BuildingAgeBand, string> = {
  PRE_1985: "Built before 1985",
  Y1985_2000: "Built between 1985 and 2000",
  POST_2000: "Built after 2000",
};

export const FLOOD_RISK_LABELS: Record<FloodRiskZone, string> = {
  LOW: "Low flood risk",
  MEDIUM: "Medium flood risk",
  HIGH: "High flood risk",
};

export const PROFILE_STEPS = [
  {
    id: "building",
    title: "Your building",
    description: "Tell us about ownership and when the building was constructed.",
  },
  {
    id: "utilities",
    title: "Utilities & environment",
    description: "Gas supply and local flood risk affect which checks apply.",
  },
  {
    id: "facilities",
    title: "Facilities on site",
    description: "Kitchens, grounds, and sleeping accommodation change your audit.",
  },
  {
    id: "operations",
    title: "How the premises is used",
    description: "Vehicles, machinery, and third-party hire.",
  },
  {
    id: "review",
    title: "Review & save",
    description: "Check your answers and see which audit sections will apply.",
  },
] as const;

export type ProfileStepId = (typeof PROFILE_STEPS)[number]["id"];

export type ProfileFormData = {
  ownershipType: OwnershipType | "";
  buildingAgeBand: BuildingAgeBand | "";
  hasGas: boolean;
  floodRiskZone: FloodRiskZone | "" | null;
  hasCateringKitchen: boolean;
  hasGrounds: boolean;
  hasSleeping: boolean;
  hasVehicles: boolean;
  hasPlantMachinery: boolean;
  hasThirdPartyUsers: boolean;
};

export const EMPTY_PROFILE_FORM: ProfileFormData = {
  ownershipType: "",
  buildingAgeBand: "",
  hasGas: false,
  floodRiskZone: null,
  hasCateringKitchen: false,
  hasGrounds: false,
  hasSleeping: false,
  hasVehicles: false,
  hasPlantMachinery: false,
  hasThirdPartyUsers: false,
};
