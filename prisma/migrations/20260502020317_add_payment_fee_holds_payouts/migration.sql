-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "platformFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 5.00;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "holdUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "platformFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_processedAt_idx" ON "WebhookEvent"("processedAt");

-- CreateIndex
CREATE INDEX "Payout_barbershopId_paidAt_idx" ON "Payout"("barbershopId", "paidAt");

-- CreateIndex
CREATE INDEX "Payout_createdById_idx" ON "Payout"("createdById");

-- CreateIndex
CREATE INDEX "Booking_holdUntil_idx" ON "Booking"("holdUntil");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
