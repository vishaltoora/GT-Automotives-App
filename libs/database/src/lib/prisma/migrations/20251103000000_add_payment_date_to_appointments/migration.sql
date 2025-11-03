-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "paymentDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Appointment_paymentDate_idx" ON "Appointment"("paymentDate");
