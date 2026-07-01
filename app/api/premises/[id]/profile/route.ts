import { NextResponse } from "next/server";
import type { BuildingAgeBand, FloodRiskZone, OwnershipType } from "@prisma/client";
import { requireAuthContext } from "@/lib/auth";
import { getPremisesForOrganisation } from "@/lib/premises";
import { prisma } from "@/lib/prisma";
import { computeApplicableSections } from "@/lib/sections";
import { EMPTY_PROFILE_FORM, type ProfileFormData } from "@/lib/profile-labels";

type RouteParams = { params: { id: string } };

function toFormData(profile: {
  ownershipType: OwnershipType;
  buildingAgeBand: BuildingAgeBand;
  hasGas: boolean;
  floodRiskZone: FloodRiskZone | null;
  hasCateringKitchen: boolean;
  hasGrounds: boolean;
  hasSleeping: boolean;
  hasVehicles: boolean;
  hasPlantMachinery: boolean;
  hasThirdPartyUsers: boolean;
}): ProfileFormData {
  return {
    ownershipType: profile.ownershipType,
    buildingAgeBand: profile.buildingAgeBand,
    hasGas: profile.hasGas,
    floodRiskZone: profile.floodRiskZone,
    hasCateringKitchen: profile.hasCateringKitchen,
    hasGrounds: profile.hasGrounds,
    hasSleeping: profile.hasSleeping,
    hasVehicles: profile.hasVehicles,
    hasPlantMachinery: profile.hasPlantMachinery,
    hasThirdPartyUsers: profile.hasThirdPartyUsers,
  };
}

function parseProfileBody(body: unknown): ProfileFormData | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const data = body as Record<string, unknown>;

  return {
    ownershipType: (data.ownershipType as OwnershipType) ?? "",
    buildingAgeBand: (data.buildingAgeBand as BuildingAgeBand) ?? "",
    hasGas: Boolean(data.hasGas),
    floodRiskZone:
      data.floodRiskZone === null || data.floodRiskZone === ""
        ? null
        : (data.floodRiskZone as FloodRiskZone),
    hasCateringKitchen: Boolean(data.hasCateringKitchen),
    hasGrounds: Boolean(data.hasGrounds),
    hasSleeping: Boolean(data.hasSleeping),
    hasVehicles: Boolean(data.hasVehicles),
    hasPlantMachinery: Boolean(data.hasPlantMachinery),
    hasThirdPartyUsers: Boolean(data.hasThirdPartyUsers),
  };
}

function validateProfileForm(form: ProfileFormData): string | null {
  if (!form.ownershipType) {
    return "Ownership type is required";
  }
  if (!form.buildingAgeBand) {
    return "Building age is required";
  }
  return null;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const premises = await getPremisesForOrganisation(params.id, auth.organisationId);

    if (!premises) {
      return NextResponse.json(
        { data: null, error: "Premises not found" },
        { status: 404 },
      );
    }

    const form = premises.profile
      ? toFormData(premises.profile)
      : EMPTY_PROFILE_FORM;

    const applicableSections = premises.profile
      ? premises.profile.applicableSections
      : [];

    return NextResponse.json({
      data: {
        premises: {
          id: premises.id,
          name: premises.name,
          address: premises.address,
        },
        profile: form,
        applicableSections,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Failed to load profile",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthContext();
    const premises = await getPremisesForOrganisation(params.id, auth.organisationId);

    if (!premises) {
      return NextResponse.json(
        { data: null, error: "Premises not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const form = parseProfileBody(body);

    if (!form) {
      return NextResponse.json(
        { data: null, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const validationError = validateProfileForm(form);
    if (validationError) {
      return NextResponse.json(
        { data: null, error: validationError },
        { status: 400 },
      );
    }

    const applicableSections = computeApplicableSections({
      buildingAgeBand: form.buildingAgeBand as BuildingAgeBand,
      hasGas: form.hasGas,
      hasSleeping: form.hasSleeping,
      hasCateringKitchen: form.hasCateringKitchen,
      hasGrounds: form.hasGrounds,
      hasVehicles: form.hasVehicles,
      hasPlantMachinery: form.hasPlantMachinery,
      hasThirdPartyUsers: form.hasThirdPartyUsers,
      floodRiskZone: form.floodRiskZone as FloodRiskZone | null,
    });

    const profile = await prisma.premisesProfile.upsert({
      where: { premisesId: premises.id },
      create: {
        premisesId: premises.id,
        ownershipType: form.ownershipType as OwnershipType,
        buildingAgeBand: form.buildingAgeBand as BuildingAgeBand,
        hasGas: form.hasGas,
        floodRiskZone: form.floodRiskZone as FloodRiskZone | null,
        hasCateringKitchen: form.hasCateringKitchen,
        hasGrounds: form.hasGrounds,
        hasSleeping: form.hasSleeping,
        hasVehicles: form.hasVehicles,
        hasPlantMachinery: form.hasPlantMachinery,
        hasThirdPartyUsers: form.hasThirdPartyUsers,
        applicableSections,
      },
      update: {
        ownershipType: form.ownershipType as OwnershipType,
        buildingAgeBand: form.buildingAgeBand as BuildingAgeBand,
        hasGas: form.hasGas,
        floodRiskZone: form.floodRiskZone as FloodRiskZone | null,
        hasCateringKitchen: form.hasCateringKitchen,
        hasGrounds: form.hasGrounds,
        hasSleeping: form.hasSleeping,
        hasVehicles: form.hasVehicles,
        hasPlantMachinery: form.hasPlantMachinery,
        hasThirdPartyUsers: form.hasThirdPartyUsers,
        applicableSections,
      },
    });

    return NextResponse.json({
      data: {
        profile: toFormData(profile),
        applicableSections: profile.applicableSections,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Failed to save profile",
      },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 },
    );
  }
}
