"use client";

import type { ReactNode } from "react";

type FieldsetProps = {
  legend: string;
  description?: string;
  children: ReactNode;
};

export function Fieldset({ legend, description, children }: FieldsetProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-medium text-slate-900">{legend}</legend>
      {description ? (
        <p className="text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type ChoiceGroupProps<T extends string> = {
  name: string;
  value: T | "";
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
};

export function ChoiceGroup<T extends string>({
  name,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
              checked
                ? "border-emerald-600 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
            />
            <span>
              <span className="block font-medium text-slate-900">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-sm text-slate-600">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

type ToggleFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
        checked
          ? "border-emerald-600 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded accent-emerald-600"
      />
      <span>
        <span className="block font-medium text-slate-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  description?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function DateField({
  id,
  label,
  value,
  required = false,
  description,
  onChange,
  onFocus,
  onBlur,
}: DateFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
      />
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}
