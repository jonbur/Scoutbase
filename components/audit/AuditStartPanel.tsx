"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form";
import type { AuditHistoryItem } from "@/types/audit";

type ActiveTemplate = {
  label: string;
  longLabel: string;
  version: string;
  revision: number;
};

type AuditStartPanelProps = {
  premisesId: string;
  premisesName: string;
  hasProfile: boolean;
  draftAuditId: string | null;
  draftAuditDate?: string | null;
};

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AuditStartPanel({
  premisesId,
  premisesName,
  hasProfile,
  draftAuditId,
  draftAuditDate,
}: AuditStartPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditHistoryItem[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<ActiveTemplate | null>(
    null,
  );
  const [defaultAuditDate, setDefaultAuditDate] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [canStartNewAudit, setCanStartNewAudit] = useState(false);

  useEffect(() => {
    if (!hasProfile) {
      return;
    }

    async function loadAuditMeta() {
      try {
        const response = await fetch(`/api/premises/${premisesId}/audit`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load audit history");
        }

        const nextDefaultDate = result.data.defaultAuditDate ?? "";
        setAudits(result.data.audits ?? []);
        setActiveTemplate(result.data.activeTemplate ?? null);
        setDefaultAuditDate(nextDefaultDate);
        setAuditDate(nextDefaultDate);
        setCanStartNewAudit(Boolean(result.data.canStartNewAudit));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load audit history",
        );
      }
    }

    loadAuditMeta();
  }, [hasProfile, premisesId]);

  async function startAudit(action: "resume" | "start" = "resume") {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/premises/${premisesId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "start"
            ? { action: "start", auditDate }
            : { action: "resume" },
        ),
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
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Safety audit</h2>
        <p className="mt-2 text-sm text-slate-600">
          Work through the Scout Association premises audit section by section.
          Each audit is tied to a template version and audit date. You can save
          progress and return later.
        </p>

        {activeTemplate ? (
          <p className="mt-3 text-sm text-slate-500">
            Current template:{" "}
            <span className="font-medium text-slate-700">
              {activeTemplate.longLabel}
            </span>
          </p>
        ) : null}

        {draftAuditId ? (
          <p className="mt-4 text-sm text-emerald-800">
            You have a draft audit in progress
            {draftAuditDate ? ` dated ${formatDate(draftAuditDate)}` : ""}.
          </p>
        ) : canStartNewAudit ? (
          <div className="mt-4">
            <label
              htmlFor="audit-date"
              className="block text-sm font-medium text-slate-700"
            >
              Audit date
            </label>
            <input
              id="audit-date"
              type="date"
              value={auditDate}
              onChange={(event) => setAuditDate(event.target.value)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Usually the date of the inspection or review. Defaults to today.
            </p>
          </div>
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
          ) : canStartNewAudit ? (
            <Button
              onClick={() => startAudit("start")}
              disabled={loading || !auditDate}
            >
              {loading ? "Starting…" : "Start audit"}
            </Button>
          ) : (
            <Button onClick={() => startAudit("resume")} disabled={loading}>
              {loading ? "Starting…" : "Start audit"}
            </Button>
          )}
        </div>
      </div>

      {audits.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Audit history</h3>
          <ul className="mt-4 divide-y divide-slate-100">
            {audits.map((audit) => (
              <li
                key={audit.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Audit · {formatDate(audit.auditDate)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Template {audit.templateLabel} ·{" "}
                    {audit.status === "COMPLETE" ? "Completed" : "Draft"} ·{" "}
                    {audit.progress.completedSections}/
                    {audit.progress.totalSections} sections
                  </p>
                  <p className="text-xs text-slate-500">
                    Started {formatDate(audit.startedAt.slice(0, 10))}
                    {audit.completedAt
                      ? ` · Completed ${formatDate(audit.completedAt.slice(0, 10))}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/premises/${premisesId}/audit/${audit.id}`}
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  {audit.status === "COMPLETE" ? "View" : "Open"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
