-- Additive resolution metadata. A node remains independent from the question bank
-- until a deterministic or reviewed match is recorded.
ALTER TABLE "knowledge_nodes" ADD COLUMN "taxonomy_status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "knowledge_nodes" ADD COLUMN "taxonomy_match" JSONB;
ALTER TABLE "knowledge_nodes" ADD COLUMN "taxonomy_matched_at" TIMESTAMP(3);

CREATE INDEX "knowledge_nodes_contest_id_taxonomy_status_idx" ON "knowledge_nodes"("contestId", "taxonomy_status");
