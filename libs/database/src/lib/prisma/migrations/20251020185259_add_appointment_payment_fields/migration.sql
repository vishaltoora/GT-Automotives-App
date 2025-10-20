-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "paymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentNotes" TEXT;
