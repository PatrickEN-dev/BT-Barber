-- Drop the (userId, date) plain index — it'll be replaced by a unique index that also serves as one
DROP INDEX "Booking_userId_date_idx";

-- A user cannot have two bookings at the same instant, regardless of barber
CREATE UNIQUE INDEX "Booking_userId_date_key" ON "Booking"("userId", "date");
