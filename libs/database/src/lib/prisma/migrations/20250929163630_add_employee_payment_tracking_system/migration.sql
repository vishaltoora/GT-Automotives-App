-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'READY', 'PAID', 'CANCELLED', 'PARTIALLY_PAID');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('REGULAR', 'OVERTIME', 'BONUS', 'COMMISSION', 'EXPENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PeriodType" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "payAmount" DECIMAL(10,2) NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "jobType" "public"."JobType" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "notes" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PayrollPeriod" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PeriodType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "public"."Job"("jobNumber");

-- CreateIndex
CREATE INDEX "Job_employeeId_idx" ON "public"."Job"("employeeId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "public"."Job"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_employeeId_idx" ON "public"."Payment"("employeeId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "public"."Payment"("paidAt");

-- CreateIndex
CREATE INDEX "PayrollPeriod_startDate_endDate_idx" ON "public"."PayrollPeriod"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_startDate_endDate_type_key" ON "public"."PayrollPeriod"("startDate", "endDate", "type");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
