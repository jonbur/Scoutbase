import type { AuditTemplateChangeType } from "@prisma/client";

export type AuditTemplateVersionLabel = {
  version: string;
  revision: number;
  changeType: AuditTemplateChangeType;
};

export function formatAuditTemplateVersion(
  template: Pick<AuditTemplateVersionLabel, "version" | "revision">,
): string {
  if (template.revision <= 1) {
    return template.version;
  }

  return `${template.version} (rev ${template.revision})`;
}

export function formatAuditTemplateVersionLong(
  template: AuditTemplateVersionLabel,
): string {
  const base = formatAuditTemplateVersion(template);
  if (template.changeType === "PATCH") {
    return `${base} · patch`;
  }

  return base;
}
