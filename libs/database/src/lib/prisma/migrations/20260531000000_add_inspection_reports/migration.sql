-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('PEACE_OF_MIND', 'OUT_OF_PROVINCE', 'PRE_PURCHASE', 'SEASONAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'FINALIZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionOverallStatus" AS ENUM ('GOOD', 'ATTENTION_SOON', 'NEEDS_REPAIR', 'UNSAFE');

-- CreateEnum
CREATE TYPE "InspectionItemKind" AS ENUM ('CONDITION', 'MEASUREMENT', 'MULTI_SELECT', 'TEXT');

-- CreateEnum
CREATE TYPE "InspectionItemStatus" AS ENUM ('GOOD', 'FAIR', 'POOR', 'NOT_APPLICABLE', 'NOT_INSPECTED');

-- CreateEnum
CREATE TYPE "InspectionPositionGroup" AS ENUM ('TIRE_SET', 'BRAKE_SET');

-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "InspectionType" NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionSection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "kind" "InspectionItemKind" NOT NULL DEFAULT 'CONDITION',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,
    "positionGroup" "InspectionPositionGroup",
    "unit" TEXT,
    "options" JSONB,
    "helpText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "appointmentId" TEXT,
    "invoiceId" TEXT,
    "roNumber" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'DRAFT',
    "overallStatus" "InspectionOverallStatus",
    "mileage" INTEGER,
    "technicianNotes" TEXT,
    "customerNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "finalizedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItemResult" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'GENERAL',
    "status" "InspectionItemStatus",
    "value" TEXT,
    "notes" TEXT,
    "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionItemResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionMedia" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "resultId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "blobName" TEXT,
    "containerName" TEXT,
    "mimeType" TEXT,
    "fileName" TEXT,
    "size" INTEGER,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplate_slug_key" ON "InspectionTemplate"("slug");

-- CreateIndex
CREATE INDEX "InspectionTemplate_type_isActive_idx" ON "InspectionTemplate"("type", "isActive");

-- CreateIndex
CREATE INDEX "InspectionSection_templateId_sortOrder_idx" ON "InspectionSection"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "InspectionItem_sectionId_sortOrder_idx" ON "InspectionItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "Inspection_customerId_idx" ON "Inspection"("customerId");

-- CreateIndex
CREATE INDEX "Inspection_vehicleId_idx" ON "Inspection"("vehicleId");

-- CreateIndex
CREATE INDEX "Inspection_appointmentId_idx" ON "Inspection"("appointmentId");

-- CreateIndex
CREATE INDEX "Inspection_invoiceId_idx" ON "Inspection"("invoiceId");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Inspection_createdAt_idx" ON "Inspection"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionItemResult_inspectionId_itemId_position_key" ON "InspectionItemResult"("inspectionId", "itemId", "position");

-- CreateIndex
CREATE INDEX "InspectionItemResult_inspectionId_idx" ON "InspectionItemResult"("inspectionId");

-- CreateIndex
CREATE INDEX "InspectionItemResult_itemId_idx" ON "InspectionItemResult"("itemId");

-- CreateIndex
CREATE INDEX "InspectionMedia_inspectionId_idx" ON "InspectionMedia"("inspectionId");

-- CreateIndex
CREATE INDEX "InspectionMedia_resultId_idx" ON "InspectionMedia"("resultId");

-- AddForeignKey
ALTER TABLE "InspectionSection" ADD CONSTRAINT "InspectionSection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "InspectionSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_finalizedById_fkey" FOREIGN KEY ("finalizedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItemResult" ADD CONSTRAINT "InspectionItemResult_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItemResult" ADD CONSTRAINT "InspectionItemResult_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InspectionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionMedia" ADD CONSTRAINT "InspectionMedia_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionMedia" ADD CONSTRAINT "InspectionMedia_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "InspectionItemResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
