-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "googleId" TEXT,
    "tokens" INTEGER NOT NULL DEFAULT 100,
    "studyLevel" TEXT,
    "dailyStudyHours" INTEGER,
    "fatigueLevel" TEXT,
    "peakEnergyTime" TEXT,
    "works" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetJob" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_nodes" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT,
    "cortex_id_num" INTEGER NOT NULL,
    "cortex_id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "associated_text" TEXT,
    "official_answer" TEXT,
    "difficulty" TEXT,
    "difficulty_num" INTEGER,
    "type" TEXT,
    "annulled" BOOLEAN NOT NULL DEFAULT false,
    "outdated" BOOLEAN NOT NULL DEFAULT false,
    "year" INTEGER,
    "exam" TEXT,
    "content_text" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "raw_json" JSONB,
    "statement_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "item_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "associated_text_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "import_batch" TEXT,
    "board_id" TEXT,
    "subject_id" TEXT,
    "topic_id" TEXT,
    "subtopic_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_subtopics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_subtopics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" TEXT NOT NULL,
    "correct_option" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "latency_ms" INTEGER,
    "switches_count" INTEGER,
    "hesitation_detected" BOOLEAN,
    "explanation" TEXT,
    "explained_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "focusScore" DOUBLE PRECISION,
    "fatigueLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "questions_cortex_id_num_key" ON "questions"("cortex_id_num");

-- CreateIndex
CREATE UNIQUE INDEX "questions_cortex_id_key" ON "questions"("cortex_id");

-- CreateIndex
CREATE UNIQUE INDEX "questions_content_hash_key" ON "questions"("content_hash");

-- CreateIndex
CREATE INDEX "questions_year_idx" ON "questions"("year");

-- CreateIndex
CREATE INDEX "questions_board_id_idx" ON "questions"("board_id");

-- CreateIndex
CREATE INDEX "questions_subject_id_idx" ON "questions"("subject_id");

-- CreateIndex
CREATE INDEX "questions_topic_id_idx" ON "questions"("topic_id");

-- CreateIndex
CREATE INDEX "questions_subtopic_id_idx" ON "questions"("subtopic_id");

-- CreateIndex
CREATE INDEX "question_options_question_id_display_order_idx" ON "question_options"("question_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_letter_key" ON "question_options"("question_id", "letter");

-- CreateIndex
CREATE UNIQUE INDEX "question_boards_name_key" ON "question_boards"("name");

-- CreateIndex
CREATE UNIQUE INDEX "question_subjects_name_key" ON "question_subjects"("name");

-- CreateIndex
CREATE INDEX "question_topics_subject_id_idx" ON "question_topics"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_topics_name_subject_id_key" ON "question_topics"("name", "subject_id");

-- CreateIndex
CREATE INDEX "question_subtopics_topic_id_idx" ON "question_subtopics"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "question_subtopics_name_topic_id_key" ON "question_subtopics"("name", "topic_id");

-- CreateIndex
CREATE INDEX "question_attempts_user_id_created_at_idx" ON "question_attempts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "question_attempts_question_id_idx" ON "question_attempts"("question_id");

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "question_boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "question_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "question_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "question_subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "question_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_subtopics" ADD CONSTRAINT "question_subtopics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "question_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
