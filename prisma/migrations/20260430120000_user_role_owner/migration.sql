-- Drop the FK pointing to BarbershopOwner
ALTER TABLE "Barbershop" DROP CONSTRAINT IF EXISTS "Barbershop_ownerId_fkey";

-- Drop legacy BarbershopOwner table (no real owners exist yet)
DROP TABLE IF EXISTS "BarbershopOwner";

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'OWNER');

-- Add role column to User
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- Re-create FK from Barbershop.ownerId to User.id
ALTER TABLE "Barbershop" ADD CONSTRAINT "Barbershop_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
