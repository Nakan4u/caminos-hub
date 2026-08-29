-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "fromLat" DOUBLE PRECISION,
ADD COLUMN     "fromLng" DOUBLE PRECISION,
ADD COLUMN     "toLat" DOUBLE PRECISION,
ADD COLUMN     "toLng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "StageTrack" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "geometry" JSONB NOT NULL,

    CONSTRAINT "StageTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageTrack_stageId_key" ON "StageTrack"("stageId");

-- AddForeignKey
ALTER TABLE "StageTrack" ADD CONSTRAINT "StageTrack_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
