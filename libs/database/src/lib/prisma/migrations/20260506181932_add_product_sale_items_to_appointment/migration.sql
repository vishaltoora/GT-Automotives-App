-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "productSaleItems" TEXT[] DEFAULT ARRAY[]::TEXT[];
