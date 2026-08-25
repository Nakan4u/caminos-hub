-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalKm" INTEGER NOT NULL,
    "typicalDays" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "startPlace" TEXT NOT NULL,
    "endPlace" TEXT NOT NULL,
    "countries" TEXT[],
    "waymarking" TEXT NOT NULL,
    "bestSeason" TEXT NOT NULL,
    "popularity" INTEGER NOT NULL,
    "isUnesco" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "fromPlace" TEXT NOT NULL,
    "toPlace" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "ascentM" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_slug_key" ON "Route"("slug");

-- CreateIndex
CREATE INDEX "Route_totalKm_idx" ON "Route"("totalKm");

-- CreateIndex
CREATE INDEX "Route_difficulty_idx" ON "Route"("difficulty");

-- CreateIndex
CREATE INDEX "Stage_routeId_idx" ON "Stage"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_routeId_order_key" ON "Stage"("routeId", "order");

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
