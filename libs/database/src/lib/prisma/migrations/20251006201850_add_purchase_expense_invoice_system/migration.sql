-- CreateEnum
CREATE TYPE "public"."PurchaseCategory" AS ENUM ('TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('RENT', 'UTILITIES', 'INSURANCE', 'ADVERTISING', 'OFFICE_SUPPLIES', 'PROFESSIONAL_FEES', 'MAINTENANCE', 'VEHICLE', 'TRAVEL', 'TRAINING', 'SOFTWARE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PurchaseInvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RecurringPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "category" "public"."PurchaseCategory" NOT NULL,
    "status" "public"."PurchaseInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" "public"."PaymentMethod",
    "notes" TEXT,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "imageSize" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExpenseInvoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL,
    "status" "public"."PurchaseInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" "public"."PaymentMethod",
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPeriod" "public"."RecurringPeriod",
    "notes" TEXT,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "imageSize" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "public"."Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_name_idx" ON "public"."Vendor"("name");

-- CreateIndex
CREATE INDEX "Vendor_isActive_idx" ON "public"."Vendor"("isActive");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_invoiceDate_idx" ON "public"."PurchaseInvoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_vendorId_idx" ON "public"."PurchaseInvoice"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_category_idx" ON "public"."PurchaseInvoice"("category");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_status_idx" ON "public"."PurchaseInvoice"("status");

-- CreateIndex
CREATE INDEX "PurchaseInvoice_createdBy_idx" ON "public"."PurchaseInvoice"("createdBy");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_invoiceDate_idx" ON "public"."ExpenseInvoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_vendorId_idx" ON "public"."ExpenseInvoice"("vendorId");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_category_idx" ON "public"."ExpenseInvoice"("category");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_status_idx" ON "public"."ExpenseInvoice"("status");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_createdBy_idx" ON "public"."ExpenseInvoice"("createdBy");

-- CreateIndex
CREATE INDEX "ExpenseInvoice_isRecurring_idx" ON "public"."ExpenseInvoice"("isRecurring");

-- AddForeignKey
ALTER TABLE "public"."PurchaseInvoice" ADD CONSTRAINT "PurchaseInvoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseInvoice" ADD CONSTRAINT "ExpenseInvoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
