-- CreateTable
CREATE TABLE "public"."ServiceType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_code_key" ON "public"."ServiceType"("code");

-- CreateIndex
CREATE INDEX "ServiceType_isActive_sortOrder_idx" ON "public"."ServiceType"("isActive", "sortOrder");

-- Seed the existing service types (previously hardcoded in the frontend).
-- Idempotent so re-running against a partially-seeded DB is safe.
INSERT INTO "public"."ServiceType" ("id", "code", "name", "duration", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'TIRE_CHANGE',     'Tire Mount Balance', 60, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'TIRE_ROTATION',   'Tire Rotation',      30, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'TIRE_REPAIR',     'Tire Repair',        30, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'TIRE_SWAP',       'Tire Swap',          30, true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'TIRE_BALANCE',    'Tire Balance',       30, true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'OIL_CHANGE',      'Oil Change',         45, true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'BRAKE_SERVICE',   'Brake Service',      90, true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'MECHANICAL_WORK', 'Mechanical Work',    60, true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'OTHER',           'Other Service',      60, true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
