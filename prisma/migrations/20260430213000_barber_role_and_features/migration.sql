-- Extend UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'BARBER';

-- Link Barber → User (one-to-one optional)
ALTER TABLE "Barber" ADD COLUMN "userId" TEXT;
CREATE UNIQUE INDEX "Barber_userId_key" ON "Barber"("userId");
ALTER TABLE "Barber" ADD CONSTRAINT "Barber_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- BarberBlock — janelas de indisponibilidade
CREATE TABLE "BarberBlock" (
  "id"        TEXT NOT NULL,
  "barberId"  TEXT NOT NULL,
  "startAt"   TIMESTAMP(3) NOT NULL,
  "endAt"     TIMESTAMP(3) NOT NULL,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BarberBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BarberBlock_barberId_startAt_idx" ON "BarberBlock"("barberId", "startAt");
ALTER TABLE "BarberBlock" ADD CONSTRAINT "BarberBlock_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BarberClientNote — notas privadas por cliente
CREATE TABLE "BarberClientNote" (
  "id"        TEXT NOT NULL,
  "barberId"  TEXT NOT NULL,
  "clientId"  TEXT NOT NULL,
  "note"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BarberClientNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BarberClientNote_barberId_clientId_idx" ON "BarberClientNote"("barberId", "clientId");
ALTER TABLE "BarberClientNote" ADD CONSTRAINT "BarberClientNote_barberId_fkey"
  FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarberClientNote" ADD CONSTRAINT "BarberClientNote_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
