-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "appointmentId" TEXT;

-- CreateTable
CREATE TABLE "public"."AppointmentPayoutRule" (
    "id" TEXT NOT NULL,
    "triggerAmount" DECIMAL(10,2) NOT NULL,
    "payoutAmount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentPayoutRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentPayoutRule_triggerAmount_key" ON "public"."AppointmentPayoutRule"("triggerAmount");

-- CreateIndex
CREATE INDEX "AppointmentPayoutRule_triggerAmount_idx" ON "public"."AppointmentPayoutRule"("triggerAmount");

-- CreateIndex
CREATE INDEX "AppointmentPayoutRule_isActive_idx" ON "public"."AppointmentPayoutRule"("isActive");

-- CreateIndex
CREATE INDEX "Job_appointmentId_idx" ON "public"."Job"("appointmentId");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
