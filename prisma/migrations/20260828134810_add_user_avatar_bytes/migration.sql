-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageType" TEXT,
ADD COLUMN     "imageUpdatedAt" TIMESTAMP(3);
