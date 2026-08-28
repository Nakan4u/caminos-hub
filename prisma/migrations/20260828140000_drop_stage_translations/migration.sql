/*
  Warnings:

  - You are about to drop the `StageTranslation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required columns `fromPlace` and `toPlace` to the `Stage` table. Existing rows are backfilled with '' and then re-seeded from `src/data/official-routes.ts`.

*/
-- DropForeignKey
ALTER TABLE "StageTranslation" DROP CONSTRAINT "StageTranslation_stageId_fkey";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN "fromPlace" TEXT NOT NULL DEFAULT '',
ADD COLUMN "toPlace" TEXT NOT NULL DEFAULT '',
ADD COLUMN "notes" TEXT;
ALTER TABLE "Stage" ALTER COLUMN "fromPlace" DROP DEFAULT,
ALTER COLUMN "toPlace" DROP DEFAULT;

-- DropTable
DROP TABLE "StageTranslation";
