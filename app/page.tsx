import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const premises = await prisma.premises.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, profile: { select: { id: true } } },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold text-slate-900">ScoutBase</h1>
      <p className="mt-2 max-w-md text-center text-slate-600">
        Compliance management for volunteer-run community buildings
      </p>
      {premises ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/premises/${premises.id}/profile`}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {premises.profile ? "Edit" : "Set up"} {premises.name} profile
          </Link>
          {premises.profile ? (
            <>
              <Link
                href={`/premises/${premises.id}/audit`}
                className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Manage audits
              </Link>
              <Link
                href={`/premises/${premises.id}/actions`}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View actions
              </Link>
              <Link
                href="/templates"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Audit templates
              </Link>
            </>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">
          Run <code className="rounded bg-slate-100 px-1">npm run db:seed</code>{" "}
          to create a demo premises.
        </p>
      )}
    </main>
  );
}
