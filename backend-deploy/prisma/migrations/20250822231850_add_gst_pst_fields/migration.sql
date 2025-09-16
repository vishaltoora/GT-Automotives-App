-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "gstAmount" DECIMAL(10,2),
ADD COLUMN     "gstRate" DECIMAL(5,4),
ADD COLUMN     "pstAmount" DECIMAL(10,2),
ADD COLUMN     "pstRate" DECIMAL(5,4);
