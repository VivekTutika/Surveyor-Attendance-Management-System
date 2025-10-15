-- DropIndex
DROP INDEX "public"."bike_trips_surveyor_id_date_key";

-- AlterTable
ALTER TABLE "bike_trips" ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "created_at" DROP DEFAULT;
