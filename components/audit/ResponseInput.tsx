"use client";

import type { ResponseValue } from "@prisma/client";
import { RESPONSE_LABELS } from "@/types/audit";

const RESPONSE_OPTIONS: ResponseValue[] = [
  "YES",
  "NO",
  "NA",
  "ACTION_NEEDED",
];

type ResponseInputProps = {
  value: ResponseValue | null;
  disabled?: boolean;
  onChange: (value: ResponseValue) => void;
};

export function ResponseInput({
  value,
  disabled = false,
  onChange,
}: ResponseInputProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {RESPONSE_OPTIONS.map((option) => {
        const selected = value === option;
        const isAction = option === "ACTION_NEEDED";

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? isAction
                  ? "border-amber-600 bg-amber-50 text-amber-900"
                  : "border-emerald-600 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {RESPONSE_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
