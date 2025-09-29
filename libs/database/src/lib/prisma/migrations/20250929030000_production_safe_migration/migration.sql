-- Production-safe migration to add Company, TireBrand, TireSize tables
-- This migration handles existing data and maintains referential integrity

-- Step 1: Create Company table
CREATE TABLE "public"."Company" (
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

-- Create unique constraint for Company
CREATE UNIQUE INDEX "Company_registrationNumber_key" ON "public"."Company"("registrationNumber");

-- Step 2: Insert default company for existing invoices
INSERT INTO "public"."Company" (
    "id",
    "name",
    "registrationNumber",
    "businessType",
    "address",
    "phone",
    "email",
    "isDefault",
    "createdAt",
    "updatedAt"
) VALUES (
    'cm1p8x9y10000abcdefghijk1',
    'GT Automotives',
    '16472991',
    'Automotive Services',
    'Prince George, BC',
    '(250) 555-0123',
    'info@gt-automotives.com',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 3: Create TireBrand table
CREATE TABLE "public"."TireBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TireBrand_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for TireBrand
CREATE UNIQUE INDEX "TireBrand_name_key" ON "public"."TireBrand"("name");

-- Step 4: Create TireSize table
CREATE TABLE "public"."TireSize" (
    "id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TireSize_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for TireSize
CREATE UNIQUE INDEX "TireSize_size_key" ON "public"."TireSize"("size");

-- Step 5: Migrate existing tire brands to TireBrand table
INSERT INTO "public"."TireBrand" ("id", "name", "createdAt", "updatedAt")
SELECT
    'tb_' || LOWER(REPLACE(REPLACE(brand, ' ', '_'), '.', '_')) || '_' || substr(md5(brand), 1, 8),
    brand,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT brand
    FROM "public"."Tire"
    WHERE brand IS NOT NULL AND brand != ''
) AS distinct_brands;

-- Step 6: Migrate existing tire sizes to TireSize table
INSERT INTO "public"."TireSize" ("id", "size", "createdAt", "updatedAt")
SELECT
    'ts_' || LOWER(REPLACE(REPLACE(size, ' ', '_'), '/', '_')) || '_' || substr(md5(size), 1, 8),
    size,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT size
    FROM "public"."Tire"
    WHERE size IS NOT NULL AND size != ''
) AS distinct_sizes;

-- Step 7: Add new columns to Tire table (nullable first)
ALTER TABLE "public"."Tire" ADD COLUMN "brandId" TEXT;
ALTER TABLE "public"."Tire" ADD COLUMN "sizeId" TEXT;

-- Step 8: Update Tire table with foreign key references
UPDATE "public"."Tire"
SET "brandId" = (
    SELECT tb."id"
    FROM "public"."TireBrand" tb
    WHERE tb."name" = "public"."Tire"."brand"
    LIMIT 1
)
WHERE "brand" IS NOT NULL AND "brand" != '';

UPDATE "public"."Tire"
SET "sizeId" = (
    SELECT ts."id"
    FROM "public"."TireSize" ts
    WHERE ts."size" = "public"."Tire"."size"
    LIMIT 1
)
WHERE "size" IS NOT NULL AND "size" != '';

-- Step 9: Handle any remaining NULL values with default entries
-- Create a default "Unknown" brand for any tires without valid brand
INSERT INTO "public"."TireBrand" ("id", "name", "createdAt", "updatedAt")
SELECT 'tb_unknown_default', 'Unknown Brand', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "public"."TireBrand" WHERE "name" = 'Unknown Brand');

-- Create a default "Unknown" size for any tires without valid size
INSERT INTO "public"."TireSize" ("id", "size", "createdAt", "updatedAt")
SELECT 'ts_unknown_default', 'Unknown Size', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "public"."TireSize" WHERE "size" = 'Unknown Size');

-- Update any remaining NULL brandId/sizeId values
UPDATE "public"."Tire"
SET "brandId" = 'tb_unknown_default'
WHERE "brandId" IS NULL;

UPDATE "public"."Tire"
SET "sizeId" = 'ts_unknown_default'
WHERE "sizeId" IS NULL;

-- Step 10: Make brandId and sizeId NOT NULL
ALTER TABLE "public"."Tire" ALTER COLUMN "brandId" SET NOT NULL;
ALTER TABLE "public"."Tire" ALTER COLUMN "sizeId" SET NOT NULL;

-- Step 11: Drop old brand and size columns
DROP INDEX IF EXISTS "public"."Tire_brand_size_idx";
ALTER TABLE "public"."Tire" DROP COLUMN "brand";
ALTER TABLE "public"."Tire" DROP COLUMN "size";

-- Step 12: Create new indexes for Tire foreign keys
CREATE INDEX "Tire_brandId_sizeId_idx" ON "public"."Tire"("brandId", "sizeId");

-- Step 13: Add foreign key constraints for Tire
ALTER TABLE "public"."Tire" ADD CONSTRAINT "Tire_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "public"."TireBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Tire" ADD CONSTRAINT "Tire_sizeId_fkey"
    FOREIGN KEY ("sizeId") REFERENCES "public"."TireSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 14: Add companyId column to Invoice table (nullable first)
ALTER TABLE "public"."Invoice" ADD COLUMN "companyId" TEXT;

-- Step 15: Update all existing invoices to use the default company
UPDATE "public"."Invoice"
SET "companyId" = 'cm1p8x9y10000abcdefghijk1'
WHERE "companyId" IS NULL;

-- Step 16: Make companyId NOT NULL
ALTER TABLE "public"."Invoice" ALTER COLUMN "companyId" SET NOT NULL;

-- Step 17: Create index and foreign key for Invoice.companyId
CREATE INDEX "Invoice_companyId_idx" ON "public"."Invoice"("companyId");

ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;