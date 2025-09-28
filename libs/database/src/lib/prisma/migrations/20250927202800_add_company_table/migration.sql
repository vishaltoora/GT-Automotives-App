-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "businessType" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Company_registrationNumber_key" ON "public"."Company"("registrationNumber");

-- AlterTable - Add companyId column to Invoice if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'Invoice'
                   AND column_name = 'companyId') THEN
        ALTER TABLE "public"."Invoice" ADD COLUMN "companyId" TEXT;
    END IF;
END $$;

-- Create default company if none exists
INSERT INTO "public"."Company" (id, name, registrationNumber, businessType, address, phone, email, "isDefault", "createdAt", "updatedAt")
SELECT
    'default-company-001',
    'GT Automotives',
    '16472991',
    'Professional Tire & Auto Services',
    'Prince George, BC',
    '250-570-2333',
    'gt-automotives@outlook.com',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "public"."Company" WHERE "registrationNumber" = '16472991');

-- Update existing invoices to use default company
UPDATE "public"."Invoice"
SET "companyId" = 'default-company-001'
WHERE "companyId" IS NULL
AND EXISTS (SELECT 1 FROM "public"."Company" WHERE id = 'default-company-001');

-- Make companyId NOT NULL after data migration
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public'
               AND table_name = 'Invoice'
               AND column_name = 'companyId'
               AND is_nullable = 'YES') THEN
        ALTER TABLE "public"."Invoice" ALTER COLUMN "companyId" SET NOT NULL;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_companyId_idx" ON "public"."Invoice"("companyId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_companyId_fkey') THEN
        ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companyId_fkey"
        FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;