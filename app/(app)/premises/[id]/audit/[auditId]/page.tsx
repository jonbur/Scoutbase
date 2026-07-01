import Link from "next/link";
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
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-950">
          This audit needs to be restarted
        </h2>
        <p className="mt-2 text-sm text-amber-900">
          No audit sections apply to the current premises profile. Update your
          profile or start a new audit.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/premises/${params.id}/profile`}
            className="inline-flex rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
          >
            Review premises profile
          </Link>
          <Link
            href={`/premises/${params.id}/audit`}
            className="inline-flex rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            Back to audit
          </Link>
        </div>
      </div>
    );
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
