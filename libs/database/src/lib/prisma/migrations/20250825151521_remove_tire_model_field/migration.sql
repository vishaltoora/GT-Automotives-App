/*
  Warnings:

  - You are about to drop the column `model` on the `Tire` table. All the data in this column will be lost.

*/
-- DropIndex
DROP INDEX "Tire_brand_size_idx";

-- AlterTable
ALTER TABLE "Tire" DROP COLUMN "model";

-- CreateIndex
CREATE INDEX "Tire_brand_size_idx" ON "Tire"("brand", "size");