/*
  Warnings:

  - You are about to drop the column `bestSeason` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `endPlace` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `startPlace` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `waymarking` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `fromPlace` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the column `toPlace` on the `Stage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "bestSeason",
DROP COLUMN "description",
DROP COLUMN "endPlace",
DROP COLUMN "name",
DROP COLUMN "startPlace",
DROP COLUMN "summary",
DROP COLUMN "waymarking";

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "fromPlace",
DROP COLUMN "notes",
DROP COLUMN "toPlace";

-- CreateTable
CREATE TABLE "RouteTranslation" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "startPlace" TEXT,
    "endPlace" TEXT,
    "waymarking" TEXT,
    "bestSeason" TEXT,

    CONSTRAINT "RouteTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTranslation" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "fromPlace" TEXT,
    "toPlace" TEXT,
    "notes" TEXT,

    CONSTRAINT "StageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RouteTranslation_locale_idx" ON "RouteTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "RouteTranslation_routeId_locale_key" ON "RouteTranslation"("routeId", "locale");

-- CreateIndex
CREATE INDEX "StageTranslation_locale_idx" ON "StageTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "StageTranslation_stageId_locale_key" ON "StageTranslation"("stageId", "locale");

-- AddForeignKey
ALTER TABLE "RouteTranslation" ADD CONSTRAINT "RouteTranslation_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTranslation" ADD CONSTRAINT "StageTranslation_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
