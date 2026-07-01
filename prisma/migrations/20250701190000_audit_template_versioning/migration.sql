-- Audit template versioning: revision within a release, audit year, and completion snapshot.

CREATE TYPE "AuditTemplateChangeType" AS ENUM ('RELEASE', 'PATCH');

DROP INDEX IF EXISTS "AuditTemplate_version_key";

ALTER TABLE "AuditTemplate"
  ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "changeType" "AuditTemplateChangeType" NOT NULL DEFAULT 'RELEASE',
  ADD COLUMN "description" TEXT,
  ADD COLUMN "supersededAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "AuditTemplate_version_revision_key" ON "AuditTemplate"("version", "revision");
CREATE INDEX "AuditTemplate_isActive_idx" ON "AuditTemplate"("isActive");
CREATE INDEX "AuditTemplate_version_idx" ON "AuditTemplate"("version");

ALTER TABLE "Audit"
  ADD COLUMN "templateRevision" INTEGER,
  ADD COLUMN "auditYear" INTEGER,
  ADD COLUMN "sectionsSnapshot" JSONB;

UPDATE "Audit" AS a
SET
  "templateRevision" = t."revision",
  "auditYear" = EXTRACT(YEAR FROM a."startedAt")::INTEGER
FROM "AuditTemplate" AS t
WHERE a."templateId" = t."id";

ALTER TABLE "Audit"
  ALTER COLUMN "templateRevision" SET NOT NULL,
  ALTER COLUMN "auditYear" SET NOT NULL;

CREATE INDEX "Audit_premisesId_auditYear_idx" ON "Audit"("premisesId", "auditYear");
