const INPUT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isInputDate(value: string): boolean {
  if (!INPUT_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function parseInputDate(value: string): Date | null {
  if (!isInputDate(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatInputDate(
  value: Date | string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toRecordedDateIso(
  value: Date | string | null | undefined,
): string | null {
  const formatted = formatInputDate(value);
  return formatted || null;
}
