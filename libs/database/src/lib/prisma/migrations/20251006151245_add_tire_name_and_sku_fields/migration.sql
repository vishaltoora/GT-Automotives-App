-- AlterTable
ALTER TABLE "public"."Tire" ADD COLUMN     "name" TEXT,
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE INDEX "Tire_sku_idx" ON "public"."Tire"("sku");
