"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form";

type AuditStartPanelProps = {
  premisesId: string;
  premisesName: string;
  hasProfile: boolean;
  draftAuditId: string | null;
};

export function AuditStartPanel({
  premisesId,
  premisesName,
  hasProfile,
  draftAuditId,
}: AuditStartPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startAudit() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/premises/${premisesId}/audit`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to start audit");
      }

      const firstSection = result.data.overview.sections[0]?.id;
      const url = firstSection
        ? `/premises/${premisesId}/audit/${result.data.auditId}?section=${firstSection}`
        : `/premises/${premisesId}/audit/${result.data.auditId}`;

      router.push(url);
    } catch (startError) {
      setError(
        startError instanceof Error ? startError.message : "Failed to start audit",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hasProfile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-950">
          Complete your premises profile first
        </h2>
        <p className="mt-2 text-sm text-amber-900">
          We need to know about your building before we can tailor the audit
          for {premisesName}.
        </p>
        <Link
          href={`/premises/${premisesId}/profile`}
          className="mt-4 inline-flex rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          Set up premises profile
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Annual safety audit</h2>
      <p className="mt-2 text-sm text-slate-600">
        Work through the Scout Association premises audit section by section.
        You can save your progress and come back later.
      </p>

      {draftAuditId ? (
        <p className="mt-4 text-sm text-emerald-800">
          You have a draft audit in progress.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {draftAuditId ? (
          <Link
            href={`/premises/${premisesId}/audit/${draftAuditId}`}
            className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Continue audit
          </Link>
        ) : (
          <Button onClick={startAudit} disabled={loading}>
            {loading ? "Starting…" : "Start audit"}
          </Button>
        )}
      </div>
    </div>
  );
}
