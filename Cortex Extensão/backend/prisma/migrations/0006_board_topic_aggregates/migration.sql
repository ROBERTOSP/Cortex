-- Statistical aggregates only: no question statement, alternatives, image or third-party record identifier.
CREATE TABLE "board_topic_aggregates" (
    "id" TEXT NOT NULL,
    "board_name" TEXT NOT NULL,
    "board_canonical_key" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "subject_canonical_key" TEXT NOT NULL,
    "topic_name" TEXT NOT NULL,
    "topic_canonical_key" TEXT NOT NULL,
    "subtopic_name" TEXT NOT NULL,
    "subtopic_canonical_key" TEXT NOT NULL,
    "year" INTEGER,
    "year_key" TEXT NOT NULL,
    "question_count" INTEGER NOT NULL,
    "active_question_count" INTEGER NOT NULL,
    "average_difficulty" DOUBLE PRECISION,
    "confidence" TEXT NOT NULL,
    "source_status" TEXT NOT NULL,
    "source_generated_at" TIMESTAMP(3),
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_topic_aggregates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bta_board_subject_topic_subtopic_year_uq"
ON "board_topic_aggregates"("board_canonical_key", "subject_canonical_key", "topic_canonical_key", "subtopic_canonical_key", "year_key");
CREATE INDEX "bta_board_subject_idx" ON "board_topic_aggregates"("board_canonical_key", "subject_canonical_key");
CREATE INDEX "bta_board_topic_idx" ON "board_topic_aggregates"("board_canonical_key", "topic_canonical_key");
CREATE INDEX "bta_board_year_idx" ON "board_topic_aggregates"("board_canonical_key", "year");
