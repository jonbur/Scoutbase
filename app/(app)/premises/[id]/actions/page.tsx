import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ActionTracker } from "@/components/actions/ActionTracker";
import { PremisesPageHeader } from "@/components/premises/PremisesPageHeader";
import { requireAuthContext } from "@/lib/auth";
import { getPremisesForOrganisation } from "@/lib/premises";

type PageProps = {
  params: { id: string };
};

export default async function PremisesActionsPage({ params }: PageProps) {
  let auth;
  try {
    auth = await requireAuthContext();
  } catch {
    redirect("/");
  }

  const premises = await getPremisesForOrganisation(
    params.id,
    auth.organisationId,
  );

  if (!premises) {
    notFound();
  }

  return (
    <div>
      <PremisesPageHeader
        premisesId={premises.id}
        premisesName={premises.name}
        address={premises.address}
        eyebrow="Actions tracker"
        description="View and manage follow-up actions raised during audits. Filter by status, priority, and due date."
      />

      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading actions…</p>}>
          <ActionTracker premisesId={premises.id} />
        </Suspense>
      </div>
    </div>
  );
}
