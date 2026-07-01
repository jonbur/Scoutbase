-- AlterTable
ALTER TABLE "AuditResponse" ADD COLUMN "needsAction" BOOLEAN NOT NULL DEFAULT false;

-- Backfill legacy responses
UPDATE "AuditResponse" SET "needsAction" = true WHERE "response" = 'ACTION_NEEDED';
