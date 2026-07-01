-- Replace auditYear with auditDate (no one-audit-per-year constraint).

ALTER TABLE "Audit" ADD COLUMN "auditDate" DATE;

UPDATE "Audit"
SET "auditDate" = "startedAt"::date
WHERE "auditDate" IS NULL;

ALTER TABLE "Audit"
  ALTER COLUMN "auditDate" SET NOT NULL;

DROP INDEX IF EXISTS "Audit_premisesId_auditYear_idx";

ALTER TABLE "Audit" DROP COLUMN "auditYear";

CREATE INDEX "Audit_premisesId_auditDate_idx" ON "Audit"("premisesId", "auditDate");
