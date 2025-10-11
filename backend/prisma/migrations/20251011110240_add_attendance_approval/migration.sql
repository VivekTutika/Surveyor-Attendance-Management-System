-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" INTEGER;
