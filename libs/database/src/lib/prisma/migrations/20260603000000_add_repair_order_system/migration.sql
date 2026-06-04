-- CreateEnum
CREATE TYPE "ROStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'READY', 'CLOSED', 'INVOICED');

-- CreateEnum
CREATE TYPE "ROServiceType" AS ENUM ('LABOR', 'PART', 'OTHER');

-- CreateEnum
CREATE TYPE "ROServiceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ROMediaType" AS ENUM ('ARRIVAL_CONDITION', 'DAMAGE_DOCUMENTATION', 'WORK_IN_PROGRESS', 'WORK_COMPLETED', 'PARTS', 'OTHER');

-- CreateTable
CREATE TABLE "repair_orders" (
    "id" TEXT NOT NULL,
    "roNumber" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "status" "ROStatus" NOT NULL DEFAULT 'OPEN',
    "customerConcern" TEXT,
    "technicianNotes" TEXT,
    "mileageIn" INTEGER,
    "mileageOut" INTEGER,
    "estimatedCost" DECIMAL(10,2),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repair_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ro_employees" (
    "id" TEXT NOT NULL,
    "repairOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ro_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ro_services" (
    "id" TEXT NOT NULL,
    "repairOrderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ROServiceType" NOT NULL DEFAULT 'LABOR',
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "technicianNotes" TEXT,
    "status" "ROServiceStatus" NOT NULL DEFAULT 'PENDING',
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ro_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ro_media" (
    "id" TEXT NOT NULL,
    "repairOrderId" TEXT NOT NULL,
    "roServiceId" TEXT,
    "fileUrl" TEXT NOT NULL,
    "blobName" TEXT,
    "containerName" TEXT,
    "mimeType" TEXT,
    "fileName" TEXT,
    "size" INTEGER,
    "caption" TEXT,
    "mediaType" "ROMediaType" NOT NULL DEFAULT 'OTHER',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ro_media_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add repairOrderId to Inspection
ALTER TABLE "Inspection" ADD COLUMN "repairOrderId" TEXT;

-- AlterTable: add repairOrderId to Invoice
ALTER TABLE "Invoice" ADD COLUMN "repairOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "repair_orders_roNumber_key" ON "repair_orders"("roNumber");
CREATE UNIQUE INDEX "repair_orders_appointmentId_key" ON "repair_orders"("appointmentId");
CREATE INDEX "repair_orders_customerId_idx" ON "repair_orders"("customerId");
CREATE INDEX "repair_orders_vehicleId_idx" ON "repair_orders"("vehicleId");
CREATE INDEX "repair_orders_status_idx" ON "repair_orders"("status");
CREATE INDEX "repair_orders_openedAt_idx" ON "repair_orders"("openedAt");

CREATE UNIQUE INDEX "ro_employees_repairOrderId_userId_key" ON "ro_employees"("repairOrderId", "userId");
CREATE INDEX "ro_employees_repairOrderId_idx" ON "ro_employees"("repairOrderId");
CREATE INDEX "ro_employees_userId_idx" ON "ro_employees"("userId");

CREATE INDEX "ro_services_repairOrderId_idx" ON "ro_services"("repairOrderId");
CREATE INDEX "ro_services_status_idx" ON "ro_services"("status");

CREATE INDEX "ro_media_repairOrderId_idx" ON "ro_media"("repairOrderId");
CREATE INDEX "ro_media_roServiceId_idx" ON "ro_media"("roServiceId");

CREATE UNIQUE INDEX "Invoice_repairOrderId_key" ON "Invoice"("repairOrderId");

-- AddForeignKey
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "repair_orders" ADD CONSTRAINT "repair_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ro_employees" ADD CONSTRAINT "ro_employees_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "repair_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ro_employees" ADD CONSTRAINT "ro_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ro_services" ADD CONSTRAINT "ro_services_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "repair_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ro_services" ADD CONSTRAINT "ro_services_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ro_media" ADD CONSTRAINT "ro_media_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "repair_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ro_media" ADD CONSTRAINT "ro_media_roServiceId_fkey" FOREIGN KEY ("roServiceId") REFERENCES "ro_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ro_media" ADD CONSTRAINT "ro_media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "repair_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_repairOrderId_fkey" FOREIGN KEY ("repairOrderId") REFERENCES "repair_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
