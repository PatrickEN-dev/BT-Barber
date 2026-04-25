-- Drop existing FKs that we'll recreate with explicit onDelete
ALTER TABLE "Barber" DROP CONSTRAINT "Barber_barbershopId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_barberId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_barbershopId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";
ALTER TABLE "Service" DROP CONSTRAINT "Service_barbershopId_fkey";
ALTER TABLE "Barbershop" DROP CONSTRAINT "Barbershop_ownerId_fkey";

-- Drop soft-delete columns (decorative; never honored in queries)
ALTER TABLE "Barber" DROP COLUMN "deletedAt";
ALTER TABLE "Barbershop" DROP COLUMN "deletedAt";
ALTER TABLE "BarbershopOwner" DROP COLUMN "deletedAt";
ALTER TABLE "Booking" DROP COLUMN "deletedAt";
ALTER TABLE "Service" DROP COLUMN "deletedAt";
ALTER TABLE "User" DROP COLUMN "deletedAt";

-- Booking.barberId becomes required (already populated for all existing rows)
ALTER TABLE "Booking" ALTER COLUMN "barberId" SET NOT NULL;

-- New junction table for normalized booking-service relation (1 Booking <-> N services)
CREATE TABLE "BookingService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "BookingService_pkey" PRIMARY KEY ("id")
);

-- Migrate existing bookings: for each row, write a BookingService pointing to the canonical
-- (lowest-id) booking in that (barberId, date) group. This coalesces multi-service rows that
-- share (barberId, date) but differ on serviceId into one Booking with N BookingService rows.
INSERT INTO "BookingService" ("id", "bookingId", "serviceId")
SELECT
  gen_random_uuid()::text,
  (SELECT b2.id
     FROM "Booking" b2
     WHERE b2."barberId" = b1."barberId" AND b2."date" = b1."date"
     ORDER BY b2.id ASC LIMIT 1),
  b1."serviceId"
FROM "Booking" b1;

-- Drop non-canonical duplicate bookings (keep one row per (barberId, date))
DELETE FROM "Booking"
WHERE id NOT IN (
  SELECT DISTINCT ON ("barberId", "date") id
  FROM "Booking"
  ORDER BY "barberId", "date", id ASC
);

-- Drop the now-redundant serviceId column
ALTER TABLE "Booking" DROP COLUMN "serviceId";

-- Indexes
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Barber_barbershopId_idx" ON "Barber"("barbershopId");
CREATE INDEX "Barbershop_ownerId_idx" ON "Barbershop"("ownerId");
CREATE INDEX "Booking_userId_date_idx" ON "Booking"("userId", "date");
CREATE INDEX "Booking_barbershopId_date_idx" ON "Booking"("barbershopId", "date");
CREATE UNIQUE INDEX "Booking_barberId_date_key" ON "Booking"("barberId", "date");
CREATE UNIQUE INDEX "BookingService_bookingId_serviceId_key" ON "BookingService"("bookingId", "serviceId");
CREATE INDEX "BookingService_serviceId_idx" ON "BookingService"("serviceId");
CREATE INDEX "Service_barbershopId_idx" ON "Service"("barbershopId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- Recreate FKs with explicit onDelete behavior
ALTER TABLE "Service" ADD CONSTRAINT "Service_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Barber" ADD CONSTRAINT "Barber_barbershopId_fkey"
  FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Barbershop" ADD CONSTRAINT "Barbershop_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "BarbershopOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
