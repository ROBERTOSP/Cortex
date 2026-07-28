ALTER TABLE "contests" ADD COLUMN "selected_job" TEXT;

CREATE TABLE "edital_versions" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_url" TEXT,
    "file_name" TEXT,
    "content_hash" TEXT,
    "extraction" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REVIEW',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" TIMESTAMP(3),
    CONSTRAINT "edital_versions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "edital_versions_contest_id_sequence_key" ON "edital_versions"("contest_id", "sequence");
CREATE INDEX "edital_versions_contest_id_is_active_idx" ON "edital_versions"("contest_id", "is_active");
ALTER TABLE "edital_versions" ADD CONSTRAINT "edital_versions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
