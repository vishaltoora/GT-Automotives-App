-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "tire_sales" (
    "id" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "soldById" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(10,2),
    "commissionAmount" DECIMAL(10,2),
    "commissionStatus" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "commissionPaidAt" TIMESTAMP(3),
    "commissionJobId" TEXT,
    "notes" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tire_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tire_sale_items" (
    "id" TEXT NOT NULL,
    "tireSaleId" TEXT NOT NULL,
    "tireId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "tireBrand" TEXT NOT NULL,
    "tireSize" TEXT NOT NULL,
    "tireType" "TireType" NOT NULL,
    "tireCondition" "TireCondition" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tire_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tire_sales_saleNumber_key" ON "tire_sales"("saleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tire_sales_invoiceId_key" ON "tire_sales"("invoiceId");

-- CreateIndex
CREATE INDEX "tire_sales_soldById_idx" ON "tire_sales"("soldById");

-- CreateIndex
CREATE INDEX "tire_sales_saleDate_idx" ON "tire_sales"("saleDate");

-- CreateIndex
CREATE INDEX "tire_sales_commissionStatus_idx" ON "tire_sales"("commissionStatus");

-- CreateIndex
CREATE INDEX "tire_sales_customerId_idx" ON "tire_sales"("customerId");

-- CreateIndex
CREATE INDEX "tire_sale_items_tireSaleId_idx" ON "tire_sale_items"("tireSaleId");

-- CreateIndex
CREATE INDEX "tire_sale_items_tireId_idx" ON "tire_sale_items"("tireId");

-- AddForeignKey
ALTER TABLE "tire_sales" ADD CONSTRAINT "tire_sales_soldById_fkey" FOREIGN KEY ("soldById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sales" ADD CONSTRAINT "tire_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sales" ADD CONSTRAINT "tire_sales_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sale_items" ADD CONSTRAINT "tire_sale_items_tireSaleId_fkey" FOREIGN KEY ("tireSaleId") REFERENCES "tire_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sale_items" ADD CONSTRAINT "tire_sale_items_tireId_fkey" FOREIGN KEY ("tireId") REFERENCES "Tire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
