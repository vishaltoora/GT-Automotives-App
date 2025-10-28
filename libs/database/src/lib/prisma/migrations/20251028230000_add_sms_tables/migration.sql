-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'UNDELIVERED');

-- CreateEnum
CREATE TYPE "SmsType" AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMATION', 'APPOINTMENT_CANCELLATION', 'SERVICE_STATUS', 'SERVICE_COMPLETE', 'PROMOTIONAL', 'EMERGENCY', 'STAFF_APPOINTMENT_ALERT', 'STAFF_SCHEDULE_REMINDER', 'ADMIN_DAILY_SUMMARY', 'ADMIN_URGENT_ALERT');

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'PENDING',
    "type" "SmsType" NOT NULL,
    "telnyxMessageId" TEXT,
    "cost" DECIMAL(10,6),
    "segments" INTEGER DEFAULT 1,
    "errorMessage" TEXT,
    "appointmentId" TEXT,
    "customerId" TEXT,
    "userId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_preferences" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT,
    "optedIn" BOOLEAN NOT NULL DEFAULT false,
    "optedInAt" TIMESTAMP(3),
    "optedOutAt" TIMESTAMP(3),
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "serviceUpdates" BOOLEAN NOT NULL DEFAULT true,
    "promotional" BOOLEAN NOT NULL DEFAULT false,
    "appointmentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "scheduleReminders" BOOLEAN NOT NULL DEFAULT true,
    "dailySummary" BOOLEAN NOT NULL DEFAULT true,
    "urgentAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sms_messages_telnyxMessageId_key" ON "sms_messages"("telnyxMessageId");

-- CreateIndex
CREATE INDEX "sms_messages_appointmentId_idx" ON "sms_messages"("appointmentId");

-- CreateIndex
CREATE INDEX "sms_messages_customerId_idx" ON "sms_messages"("customerId");

-- CreateIndex
CREATE INDEX "sms_messages_userId_idx" ON "sms_messages"("userId");

-- CreateIndex
CREATE INDEX "sms_messages_status_idx" ON "sms_messages"("status");

-- CreateIndex
CREATE INDEX "sms_messages_type_idx" ON "sms_messages"("type");

-- CreateIndex
CREATE INDEX "sms_messages_createdAt_idx" ON "sms_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sms_preferences_customerId_key" ON "sms_preferences"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "sms_preferences_userId_key" ON "sms_preferences"("userId");

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_preferences" ADD CONSTRAINT "sms_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_preferences" ADD CONSTRAINT "sms_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
