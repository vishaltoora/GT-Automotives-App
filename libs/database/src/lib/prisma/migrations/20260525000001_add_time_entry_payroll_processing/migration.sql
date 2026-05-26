-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN "payrollProcessedBy" TEXT;
ALTER TABLE "TimeEntry" ADD COLUMN "payrollProcessedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_payrollProcessedAt_idx" ON "TimeEntry"("employeeId", "payrollProcessedAt");
