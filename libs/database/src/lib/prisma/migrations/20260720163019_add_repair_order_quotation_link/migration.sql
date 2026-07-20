-- AlterTable
ALTER TABLE "public"."repair_orders" ADD COLUMN     "quotationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "repair_orders_quotationId_key" ON "public"."repair_orders"("quotationId");

-- AddForeignKey
ALTER TABLE "public"."repair_orders" ADD CONSTRAINT "repair_orders_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "public"."Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
