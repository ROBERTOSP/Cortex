ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

CREATE TABLE "shared_editals" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "board" TEXT,
  "exam_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "extraction" JSONB,
  "source_text" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shared_editals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shared_editals_status_idx" ON "shared_editals"("status");
