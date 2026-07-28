-- Additive workflow state for edital extraction and human confirmation.
ALTER TABLE "contests" ADD COLUMN "edital_source" TEXT;
ALTER TABLE "contests" ADD COLUMN "edital_source_url" TEXT;
ALTER TABLE "contests" ADD COLUMN "edital_draft" JSONB;
ALTER TABLE "contests" ADD COLUMN "edital_extracted_at" TIMESTAMP(3);
ALTER TABLE "contests" ADD COLUMN "edital_confirmed_at" TIMESTAMP(3);

CREATE INDEX "contests_user_id_status_idx" ON "contests"("userId", "status");
