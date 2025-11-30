-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'PROCESSED');

-- CreateTable
CREATE TABLE "booking_requests" (
    "id" TEXT NOT NULL,
    "appointmentType" "AppointmentType" NOT NULL DEFAULT 'AT_GARAGE',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "serviceType" TEXT NOT NULL,
    "requestedDate" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "notes" TEXT,
    "status" "BookingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "customerId" TEXT,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_requests_customerId_idx" ON "booking_requests"("customerId");

-- CreateIndex
CREATE INDEX "booking_requests_appointmentId_idx" ON "booking_requests"("appointmentId");

-- CreateIndex
CREATE INDEX "booking_requests_status_idx" ON "booking_requests"("status");

-- CreateIndex
CREATE INDEX "booking_requests_createdAt_idx" ON "booking_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
