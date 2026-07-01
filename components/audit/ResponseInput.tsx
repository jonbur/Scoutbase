"use client";

import type { ResponseValue } from "@prisma/client";
import { RESPONSE_LABELS } from "@/types/audit";

export const PRIMARY_RESPONSE_VALUES = ["YES", "NO", "NA"] as const;

export type PrimaryResponseValue = (typeof PRIMARY_RESPONSE_VALUES)[number];

type ResponseInputProps = {
  value: PrimaryResponseValue | null;
  disabled?: boolean;
  onChange: (value: PrimaryResponseValue) => void;
};

export function ResponseInput({
  value,
  disabled = false,
  onChange,
}: ResponseInputProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRIMARY_RESPONSE_VALUES.map((option) => {
        const selected = value === option;

        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "border-emerald-600 bg-emerald-50 text-emerald-900"
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

export function isPrimaryResponse(
  value: ResponseValue | null | undefined,
): value is PrimaryResponseValue {
  return value === "YES" || value === "NO" || value === "NA";
}
