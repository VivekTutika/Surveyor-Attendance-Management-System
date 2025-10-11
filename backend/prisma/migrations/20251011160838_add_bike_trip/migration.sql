-- CreateTable
CREATE TABLE "bike_trips" (
    "id" SERIAL NOT NULL,
    "surveyor_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "morning_reading_id" TEXT,
    "evening_reading_id" TEXT,
    "morning_km" DOUBLE PRECISION,
    "evening_km" DOUBLE PRECISION,
    "computed_km" DOUBLE PRECISION,
    "final_km" DOUBLE PRECISION,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bike_trips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bike_trips_surveyor_id_date_key" ON "bike_trips"("surveyor_id", "date");

-- AddForeignKey
ALTER TABLE "bike_trips" ADD CONSTRAINT "bike_trips_surveyor_id_fkey" FOREIGN KEY ("surveyor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
