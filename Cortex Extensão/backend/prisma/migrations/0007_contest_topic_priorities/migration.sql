ALTER TABLE "knowledge_nodes" ADD COLUMN "strategic_priority" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "knowledge_nodes" ADD COLUMN "priority_evidence" JSONB;
ALTER TABLE "knowledge_nodes" ADD COLUMN "priority_calculated_at" TIMESTAMP(3);

CREATE INDEX "knowledge_nodes_contest_id_strategic_priority_idx" ON "knowledge_nodes"("contestId", "strategic_priority");
