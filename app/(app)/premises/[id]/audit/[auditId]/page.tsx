import { notFound, redirect } from "next/navigation";
import { AuditWizard } from "@/components/audit/AuditWizard";
import { requireAuthContext } from "@/lib/auth";
import { buildAuditOverview, getAuditForOrganisation } from "@/lib/audit";

type PageProps = {
  params: { id: string; auditId: string };
  searchParams: { section?: string };
};

export default async function AuditWizardPage({
  params,
  searchParams,
}: PageProps) {
  let auth;
  try {
    auth = await requireAuthContext();
  } catch {
    redirect("/");
  }

  const audit = await getAuditForOrganisation(params.auditId, auth.organisationId);

  if (!audit || audit.premises.id !== params.id) {
    notFound();
  }

  const overview = buildAuditOverview(audit);
  const initialSectionId =
    searchParams.section &&
    overview.sections.some((section) => section.id === searchParams.section)
      ? searchParams.section
      : overview.sections[0]?.id;

  if (!initialSectionId) {
    notFound();
  }

  return (
    <AuditWizard
      premisesId={params.id}
      auditId={params.auditId}
      initialOverview={overview}
      initialSectionId={initialSectionId}
    />
  );
}
