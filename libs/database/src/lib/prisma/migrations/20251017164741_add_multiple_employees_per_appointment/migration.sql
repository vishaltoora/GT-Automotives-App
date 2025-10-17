-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_jobId_fkey";

-- CreateTable
CREATE TABLE "public"."AppointmentEmployee" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentEmployee_appointmentId_idx" ON "public"."AppointmentEmployee"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentEmployee_employeeId_idx" ON "public"."AppointmentEmployee"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentEmployee_appointmentId_employeeId_key" ON "public"."AppointmentEmployee"("appointmentId", "employeeId");

-- AddForeignKey
ALTER TABLE "public"."AppointmentEmployee" ADD CONSTRAINT "AppointmentEmployee_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppointmentEmployee" ADD CONSTRAINT "AppointmentEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
