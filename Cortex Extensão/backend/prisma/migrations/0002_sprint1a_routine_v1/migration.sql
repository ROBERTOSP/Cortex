-- CreateEnum
CREATE TYPE "StudyGoalType" AS ENUM ('APPROVAL', 'GENERAL_STUDY', 'CAREER_TRANSITION');

-- CreateEnum
CREATE TYPE "StudyGoalPhase" AS ENUM ('PRE_NOTICE', 'POST_NOTICE');

-- CreateEnum
CREATE TYPE "StudyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EnergyPeriod" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "FatigueLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "StudyContext" AS ENUM ('HOME', 'WORK', 'COMMUTE', 'LIBRARY', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'LAPTOP', 'TABLET', 'PHONE', 'PAPER');

-- CreateEnum
CREATE TYPE "WindowFlexibility" AS ENUM ('STRICT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "AllowedActivity" AS ENUM ('THEORY', 'REVIEW', 'QUESTIONS', 'FLASHCARDS', 'VIDEO', 'AUDIO', 'NOTES', 'SIMULATION', 'ESSAY_PRACTICE');

-- CreateEnum
CREATE TYPE "CommitmentCategory" AS ENUM ('WORK', 'COMMUTE', 'COLLEGE', 'FAMILY', 'EXERCISE', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanMode" AS ENUM ('RIGID', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "MissedDayStrategy" AS ENUM ('REDISTRIBUTE', 'ASK_BEFORE', 'KEEP_PENDING', 'DROP_LOW_PRIORITY');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboarding_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "study_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "StudyGoalType" NOT NULL,
    "study_level" "StudyLevel" NOT NULL,
    "phase" "StudyGoalPhase" NOT NULL,
    "title" TEXT NOT NULL,
    "target_job" TEXT NOT NULL,
    "board" TEXT,
    "exam_date" TIMESTAMP(3),
    "exam_date_unknown" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_routines" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "onboarding_schema_version" INTEGER NOT NULL DEFAULT 1,
    "timezone" TEXT,
    "wake_time_minute" INTEGER,
    "sleep_time_minute" INTEGER,
    "peak_energy_period" "EnergyPeriod",
    "habitual_fatigue_level" "FatigueLevel",
    "preferred_session_minutes" INTEGER,
    "plan_mode" "PlanMode",
    "max_subjects_per_day" INTEGER,
    "wants_day_off" BOOLEAN NOT NULL DEFAULT false,
    "day_off_preference" "DayOfWeek",
    "bad_day_minimum_minutes" INTEGER,
    "missed_day_strategy" "MissedDayStrategy",
    "routine_onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_windows" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "context" "StudyContext" NOT NULL,
    "devices" "DeviceType"[] DEFAULT ARRAY[]::"DeviceType"[],
    "flexibility" "WindowFlexibility" NOT NULL,
    "allowed_activities" "AllowedActivity"[] DEFAULT ARRAY[]::"AllowedActivity"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_commitments" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "category" "CommitmentCategory" NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "flexibility" "WindowFlexibility" NOT NULL,
    "note" VARCHAR(140),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_check_ins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "routine_id" TEXT,
    "date_key" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "energy" INTEGER NOT NULL,
    "focus" INTEGER NOT NULL,
    "fatigue" INTEGER NOT NULL,
    "available_minutes_override" INTEGER,
    "note" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_goals_user_id_key" ON "study_goals"("user_id");

-- CreateIndex
CREATE INDEX "study_goals_type_idx" ON "study_goals"("type");

-- CreateIndex
CREATE UNIQUE INDEX "user_routines_user_id_key" ON "user_routines"("user_id");

-- CreateIndex
CREATE INDEX "user_routines_timezone_idx" ON "user_routines"("timezone");

-- CreateIndex
CREATE INDEX "availability_windows_routine_id_day_of_week_idx" ON "availability_windows"("routine_id", "day_of_week");

-- CreateIndex
CREATE INDEX "availability_windows_routine_id_day_of_week_start_minute_idx" ON "availability_windows"("routine_id", "day_of_week", "start_minute");

-- CreateIndex
CREATE UNIQUE INDEX "availability_windows_routine_id_day_of_week_start_minute_en_key" ON "availability_windows"("routine_id", "day_of_week", "start_minute", "end_minute");

-- CreateIndex
CREATE INDEX "routine_commitments_routine_id_day_of_week_idx" ON "routine_commitments"("routine_id", "day_of_week");

-- CreateIndex
CREATE INDEX "routine_commitments_routine_id_day_of_week_start_minute_idx" ON "routine_commitments"("routine_id", "day_of_week", "start_minute");

-- CreateIndex
CREATE UNIQUE INDEX "routine_commitments_routine_id_day_of_week_start_minute_end_key" ON "routine_commitments"("routine_id", "day_of_week", "start_minute", "end_minute", "category");

-- CreateIndex
CREATE UNIQUE INDEX "daily_check_ins_user_id_date_key_key" ON "daily_check_ins"("user_id", "date_key");

-- AddForeignKey
ALTER TABLE "study_goals" ADD CONSTRAINT "study_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_routines" ADD CONSTRAINT "user_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_windows" ADD CONSTRAINT "availability_windows_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "user_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_commitments" ADD CONSTRAINT "routine_commitments_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "user_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "user_routines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
