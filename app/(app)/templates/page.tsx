import { TemplateManager } from "@/components/templates/TemplateManager";

export default function TemplatesPage() {
  return (
    <div>
      <p className="text-sm font-medium text-emerald-700">Template library</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">
        Audit templates
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Upload new questionnaire releases and manage which template version is
        active by default. Each audit is pinned to the template used when it was
        started.
      </p>

      <div className="mt-8">
        <TemplateManager />
      </div>
    </div>
  );
}
