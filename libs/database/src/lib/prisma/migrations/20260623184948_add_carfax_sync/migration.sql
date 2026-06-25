-- CreateEnum
CREATE TYPE "public"."CarfaxSyncStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."carfax_syncs" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "vin" TEXT,
    "serviceDate" TIMESTAMP(3),
    "odometer" INTEGER,
    "payload" JSONB,
    "status" "public"."CarfaxSyncStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carfax_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carfax_syncs_invoiceId_key" ON "public"."carfax_syncs"("invoiceId");

-- CreateIndex
CREATE INDEX "carfax_syncs_status_idx" ON "public"."carfax_syncs"("status");

-- CreateIndex
CREATE INDEX "carfax_syncs_createdAt_idx" ON "public"."carfax_syncs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."carfax_syncs" ADD CONSTRAINT "carfax_syncs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
