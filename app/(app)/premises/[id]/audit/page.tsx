import { notFound, redirect } from "next/navigation";
import { AuditStatus } from "@prisma/client";
import { AuditStartPanel } from "@/components/audit/AuditStartPanel";
import { PremisesPageHeader } from "@/components/premises/PremisesPageHeader";
import { requireAuthContext } from "@/lib/auth";
import { getPremisesForOrganisation } from "@/lib/premises";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: { id: string };
};

export default async function PremisesAuditPage({ params }: PageProps) {
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

  const draft = await prisma.audit.findFirst({
    where: {
      premisesId: premises.id,
      status: AuditStatus.DRAFT,
    },
    select: { id: true, auditDate: true },
  });

  return (
    <div>
      <PremisesPageHeader
        premisesId={premises.id}
        premisesName={premises.name}
        address={premises.address}
        eyebrow="Annual safety audit"
      />

      <div className="mt-8">
        <AuditStartPanel
          premisesId={premises.id}
          premisesName={premises.name}
          hasProfile={Boolean(premises.profile)}
          draftAuditId={draft?.id ?? null}
          draftAuditDate={
            draft?.auditDate
              ? draft.auditDate.toISOString().slice(0, 10)
              : null
          }
        />
      </div>
    </div>
  );
}
