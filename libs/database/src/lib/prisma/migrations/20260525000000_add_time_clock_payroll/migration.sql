-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('HOURLY', 'SALARIED');

-- CreateEnum
CREATE TYPE "TimeEntryStatus" AS ENUM ('OPEN', 'ON_BREAK', 'CLOCKED_OUT', 'APPROVED', 'ADJUSTED', 'VOIDED');

-- CreateEnum
CREATE TYPE "TimeEntrySource" AS ENUM ('EMPLOYEE', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('MEAL', 'REST', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PayrollAdjustmentType" AS ENUM ('BONUS', 'REIMBURSEMENT', 'DEDUCTION', 'OTHER');

-- CreateTable
CREATE TABLE "EmployeeCompensation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payType" "PayType" NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "annualSalary" DECIMAL(10,2),
    "expectedWeeklyHours" DECIMAL(5,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeCompensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "clockInAt" TIMESTAMP(3) NOT NULL,
    "clockOutAt" TIMESTAMP(3),
    "status" "TimeEntryStatus" NOT NULL DEFAULT 'OPEN',
    "source" "TimeEntrySource" NOT NULL DEFAULT 'EMPLOYEE',
    "notes" TEXT,
    "adjustedBy" TEXT,
    "adjustmentReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakEntry" (
    "id" TEXT NOT NULL,
    "timeEntryId" TEXT NOT NULL,
    "breakType" "BreakType" NOT NULL DEFAULT 'MEAL',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAdjustment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "PayrollAdjustmentType" NOT NULL DEFAULT 'BONUS',
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeCompensation_employeeId_idx" ON "EmployeeCompensation"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeCompensation_employeeId_isActive_idx" ON "EmployeeCompensation"("employeeId", "isActive");

-- CreateIndex
CREATE INDEX "EmployeeCompensation_effectiveFrom_effectiveTo_idx" ON "EmployeeCompensation"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_status_idx" ON "TimeEntry"("status");

-- CreateIndex
CREATE INDEX "TimeEntry_clockInAt_idx" ON "TimeEntry"("clockInAt");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_status_idx" ON "TimeEntry"("employeeId", "status");

-- CreateIndex
CREATE INDEX "BreakEntry_timeEntryId_idx" ON "BreakEntry"("timeEntryId");

-- CreateIndex
CREATE INDEX "BreakEntry_startAt_idx" ON "BreakEntry"("startAt");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_employeeId_idx" ON "PayrollAdjustment"("employeeId");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_type_idx" ON "PayrollAdjustment"("type");

-- CreateIndex
CREATE INDEX "PayrollAdjustment_effectiveDate_idx" ON "PayrollAdjustment"("effectiveDate");

-- AddForeignKey
ALTER TABLE "EmployeeCompensation" ADD CONSTRAINT "EmployeeCompensation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakEntry" ADD CONSTRAINT "BreakEntry_timeEntryId_fkey" FOREIGN KEY ("timeEntryId") REFERENCES "TimeEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollAdjustment" ADD CONSTRAINT "PayrollAdjustment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
