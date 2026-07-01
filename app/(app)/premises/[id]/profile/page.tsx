import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthContext } from "@/lib/auth";
import { getPremisesForOrganisation } from "@/lib/premises";
import { EMPTY_PROFILE_FORM } from "@/lib/profile-labels";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { PremisesPageHeader } from "@/components/premises/PremisesPageHeader";
import type { ProfileFormData } from "@/lib/profile-labels";
import type { BuildingAgeBand, FloodRiskZone, OwnershipType } from "@prisma/client";

type PageProps = {
  params: { id: string };
};

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

export default async function PremisesProfilePage({ params }: PageProps) {
  let auth;
  try {
    auth = await requireAuthContext();
  } catch {
    redirect("/");
  }

  const premises = await getPremisesForOrganisation(params.id, auth.organisationId);

  if (!premises) {
    notFound();
  }

  const initialProfile = premises.profile
    ? toFormData(premises.profile)
    : EMPTY_PROFILE_FORM;

  const initialApplicableSections = premises.profile?.applicableSections ?? [];

  return (
    <div>
      <PremisesPageHeader
        premisesId={premises.id}
        premisesName={premises.name}
        address={premises.address}
        eyebrow="Premises profile"
        description="Answer a few questions about your premises. We'll tailor the annual safety audit to what applies to your building — usually about five minutes."
      />
      {premises.profile ? (
        <Link
          href={`/premises/${premises.id}/audit`}
          className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Go to annual audit →
        </Link>
      ) : null}
      <div className="mt-8">
        <ProfileWizard
          premisesId={premises.id}
          initialProfile={initialProfile}
          initialApplicableSections={initialApplicableSections}
        />
      </div>
    </div>
  );
}
