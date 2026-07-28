-- This migration is intentionally additive. Existing taxonomy rows are not
-- automatically merged or renamed: equivalence must be reviewed first.

-- CreateEnum
CREATE TYPE "QuestionRightsStatus" AS ENUM ('PENDING', 'INTERNAL_RESTRICTED', 'AUTHORIZED', 'LICENSED', 'OFFICIAL_SOURCE_REVIEW', 'REMOVED');

-- AlterTable
ALTER TABLE "question_boards" ADD COLUMN "canonical_key" TEXT;
ALTER TABLE "question_subjects" ADD COLUMN "canonical_key" TEXT;
ALTER TABLE "question_topics" ADD COLUMN "canonical_key" TEXT;
ALTER TABLE "question_subtopics" ADD COLUMN "canonical_key" TEXT;

-- CreateTable
CREATE TABLE "question_provenance" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "source_system" TEXT NOT NULL,
    "source_record_id" TEXT,
    "source_file" TEXT,
    "source_url" TEXT,
    "primary_source_url" TEXT,
    "provenance_confidence" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "rights_status" "QuestionRightsStatus" NOT NULL DEFAULT 'PENDING',
    "rights_basis" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_provenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_boards_canonical_key_idx" ON "question_boards"("canonical_key");
CREATE INDEX "question_subjects_canonical_key_idx" ON "question_subjects"("canonical_key");
CREATE INDEX "question_topics_canonical_key_subject_id_idx" ON "question_topics"("canonical_key", "subject_id");
CREATE INDEX "question_subtopics_canonical_key_topic_id_idx" ON "question_subtopics"("canonical_key", "topic_id");
CREATE UNIQUE INDEX "question_provenance_question_id_key" ON "question_provenance"("question_id");
CREATE INDEX "question_provenance_rights_status_idx" ON "question_provenance"("rights_status");
CREATE INDEX "question_provenance_source_system_idx" ON "question_provenance"("source_system");

-- AddForeignKey
ALTER TABLE "question_provenance" ADD CONSTRAINT "question_provenance_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
