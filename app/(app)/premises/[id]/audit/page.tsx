import { notFound, redirect } from "next/navigation";
import { AuditStatus } from "@prisma/client";
import { AuditStartPanel } from "@/components/audit/AuditStartPanel";
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
    select: { id: true },
  });

  return (
    <div>
      <p className="text-sm font-medium text-emerald-700">Annual safety audit</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">{premises.name}</h1>
      <p className="mt-1 text-slate-600">{premises.address}</p>

      <div className="mt-8">
        <AuditStartPanel
          premisesId={premises.id}
          premisesName={premises.name}
          hasProfile={Boolean(premises.profile)}
          draftAuditId={draft?.id ?? null}
        />
      </div>
    </div>
  );
}
