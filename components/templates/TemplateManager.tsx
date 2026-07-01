"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/form";

type TemplateCatalogItem = {
  id: string;
  version: string;
  revision: number;
  label: string;
  longLabel: string;
  description: string | null;
  publishedAt: string;
  isActive: boolean;
  changeType: string;
  sectionCount: number;
  auditCount: number;
  supersededAt: string | null;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TemplateManager() {
  const [templates, setTemplates] = useState<TemplateCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [version, setVersion] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState("");
  const [setActive, setSetActive] = useState(true);
  const [jsonText, setJsonText] = useState("");

  async function loadTemplates() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/audit-templates");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to load templates");
      }

      setTemplates(result.data.templates ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load templates",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      setJsonText(text);

      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.version === "string" && !version) {
        setVersion(parsed.version);
      }
      if (typeof parsed.publishedAt === "string") {
        setPublishedAt(parsed.publishedAt.slice(0, 10));
      }
      if (typeof parsed.description === "string" && !description) {
        setDescription(parsed.description);
      }

      setSuccess(`Loaded ${file.name}. Review the fields below, then publish.`);
      setError(null);
    } catch {
      setError("Could not read template file. Upload valid JSON.");
    }
  }

  async function publishTemplate() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let sections: unknown;
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      sections = parsed.sections ?? parsed;

      const response = await fetch("/api/audit-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          publishedAt,
          description: description || null,
          sections,
          setActive,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to publish template");
      }

      setSuccess(`Published template ${result.data.template.longLabel}.`);
      setJsonText("");
      setVersion("");
      setDescription("");
      await loadTemplates();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish template",
      );
    } finally {
      setSaving(false);
    }
  }

  async function activateTemplate(templateId: string) {
    setActivatingId(templateId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/audit-templates/${templateId}/activate`,
        { method: "POST" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to activate template");
      }

      setSuccess(`Set ${result.data.template.longLabel} as the active default.`);
      await loadTemplates();
    } catch (activateError) {
      setError(
        activateError instanceof Error
          ? activateError.message
          : "Failed to activate template",
      );
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Upload a new template release
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Import a JSON questionnaire as a new template version. Use the normalized
          sections array format (same structure as the seeded September 2025
          template).
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              Template JSON file
            </span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-slate-600"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">
                Version label
              </span>
              <input
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="2026-09"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700">
                Published date
              </span>
              <input
                type="date"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              Description
            </span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Scout Association premises audit — September 2026"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={setActive}
              onChange={(event) => setSetActive(event.target.checked)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            Set as active default for new audits
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700">
              Sections JSON
            </span>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              placeholder='Paste or upload JSON with a "sections" array…'
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}
        {success ? (
          <p className="mt-4 text-sm text-emerald-700">{success}</p>
        ) : null}

        <div className="mt-6">
          <Button
            onClick={() => void publishTemplate()}
            disabled={saving || !version || !jsonText.trim()}
          >
            {saving ? "Publishing…" : "Publish template release"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Template catalog</h2>
        <p className="mt-2 text-sm text-slate-600">
          All published template versions and revisions. The active template is the
          default when starting an audit without choosing another.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading templates…</p>
        ) : templates.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No templates published yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Template</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Published</th>
                  <th className="py-2 pr-4 font-medium">Sections</th>
                  <th className="py-2 pr-4 font-medium">Audits</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{template.longLabel}</p>
                      {template.description ? (
                        <p className="text-xs text-slate-500">{template.description}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {template.changeType === "PATCH" ? "Patch" : "Release"}
                      {template.isActive ? (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Active
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {formatDate(template.publishedAt)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {template.sectionCount}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{template.auditCount}</td>
                    <td className="py-3 text-right">
                      {!template.isActive ? (
                        <button
                          type="button"
                          onClick={() => void activateTemplate(template.id)}
                          disabled={activatingId === template.id}
                          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
                        >
                          {activatingId === template.id
                            ? "Activating…"
                            : "Set active"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Default</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-500">
        To start an audit against a specific template, go to a premises{" "}
        <Link href="/" className="font-medium text-emerald-700 hover:text-emerald-800">
          audits page
        </Link>
        .
      </p>
    </div>
  );
}
