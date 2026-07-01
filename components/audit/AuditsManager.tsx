"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/form";
import type { AuditHistoryItem } from "@/types/audit";

type TemplateOption = {
  id: string;
  version: string;
  revision: number;
  label: string;
  longLabel: string;
  isActive: boolean;
};

type AuditsManagerProps = {
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

export function AuditsManager({
  premisesId,
  premisesName,
  hasProfile,
  draftAuditId,
  draftAuditDate,
}: AuditsManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audits, setAudits] = useState<AuditHistoryItem[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [canStartNewAudit, setCanStartNewAudit] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "COMPLETE">(
    "ALL",
  );

  useEffect(() => {
    if (!hasProfile) {
      return;
    }

    async function loadAuditMeta() {
      try {
        const response = await fetch(`/api/premises/${premisesId}/audit`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Failed to load audits");
        }

        const nextTemplates: TemplateOption[] = result.data.templates ?? [];
        const active = result.data.activeTemplate;

        setAudits(result.data.audits ?? []);
        setTemplates(nextTemplates);
        setCanStartNewAudit(Boolean(result.data.canStartNewAudit));
        setAuditDate(result.data.defaultAuditDate ?? "");

        const defaultTemplateId =
          active?.id ??
          nextTemplates.find((template) => template.isActive)?.id ??
          nextTemplates[0]?.id ??
          "";

        setActiveTemplateId(defaultTemplateId);
        setSelectedTemplateId(defaultTemplateId);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load audits",
        );
      }
    }

    loadAuditMeta();
  }, [hasProfile, premisesId]);

  async function startAudit() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/premises/${premisesId}/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          auditDate,
          templateId: selectedTemplateId || undefined,
        }),
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

  const filteredAudits = audits.filter((audit) => {
    if (statusFilter === "ALL") {
      return true;
    }
    return audit.status === statusFilter;
  });

  if (!hasProfile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-950">
          Complete your premises profile first
        </h2>
        <p className="mt-2 text-sm text-amber-900">
          We need to know about your building before we can tailor audits for{" "}
          {premisesName}.
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
      {draftAuditId ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-sm font-semibold text-emerald-900">Draft in progress</h2>
          <p className="mt-1 text-sm text-emerald-800">
            You have an audit in progress
            {draftAuditDate ? ` dated ${formatDate(draftAuditDate)}` : ""}. Finish
            or continue it before starting another.
          </p>
          <Link
            href={`/premises/${premisesId}/audit/${draftAuditId}`}
            className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Continue draft audit
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Start a new audit</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose an audit template and inspection date. Each audit is pinned to
            that template version when you start.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">
                Audit template
              </span>
              <select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {templates.length === 0 ? (
                  <option value="">No templates available</option>
                ) : (
                  templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.longLabel}
                      {template.isActive ? " · active default" : ""}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-slate-700">
                Audit date
              </span>
              <input
                type="date"
                value={auditDate}
                onChange={(event) => setAuditDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Need a new questionnaire?{" "}
            <Link href="/templates" className="font-medium text-emerald-700 hover:text-emerald-800">
              Upload or manage templates
            </Link>
            .
          </p>

          {error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : null}

          <div className="mt-6">
            <Button
              onClick={() => void startAudit()}
              disabled={loading || !auditDate || !selectedTemplateId || !canStartNewAudit}
            >
              {loading ? "Starting…" : "Start audit"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Audit history</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Status
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETE">Completed</option>
            </select>
          </label>
        </div>

        {filteredAudits.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No audits match your filters.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Template</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Progress</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((audit) => (
                  <tr key={audit.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-slate-900">
                      {formatDate(audit.auditDate)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {audit.templateLabel}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          audit.status === "COMPLETE"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {audit.status === "COMPLETE" ? "Completed" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {audit.progress.completedSections}/{audit.progress.totalSections}{" "}
                      sections
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/premises/${premisesId}/audit/${audit.id}`}
                        className="font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        {audit.status === "COMPLETE" ? "View" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeTemplateId && templates.length > 0 ? (
        <p className="text-xs text-slate-500">
          Organisation default template:{" "}
          {templates.find((template) => template.id === activeTemplateId)?.longLabel ??
            "Not set"}
        </p>
      ) : null}
    </div>
  );
}
