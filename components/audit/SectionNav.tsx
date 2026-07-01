"use client";

import type { AuditSectionStatus } from "@prisma/client";
import type { AuditSectionSummary } from "@/types/audit";

type SectionNavProps = {
  sections: AuditSectionSummary[];
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
};

function statusStyles(status: AuditSectionStatus): string {
  switch (status) {
    case "COMPLETE":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "IN_PROGRESS":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "SKIPPED":
      return "border-slate-200 bg-slate-100 text-slate-500";
    default:
      return "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
  }
}

export function SectionNav({
  sections,
  activeSectionId,
  onSelect,
}: SectionNavProps) {
  return (
    <nav aria-label="Audit sections" className="space-y-2">
      {sections.map((section) => {
        const isActive = section.id === activeSectionId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
              isActive
                ? "border-emerald-600 ring-1 ring-emerald-600"
                : statusStyles(section.status)
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
              {section.number}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{section.title}</span>
              <span className="mt-0.5 block text-xs opacity-80">
                {section.answeredCount}/{section.itemCount} answered
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
