-- CreateTable
CREATE TABLE "public"."PayStub" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "payDate" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT,
    "employeeName" TEXT NOT NULL,
    "position" TEXT,
    "payRate" DECIMAL(10,2),
    "payType" "public"."PayType" NOT NULL DEFAULT 'HOURLY',
    "regularHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "regularAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grossPay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "eiAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cppAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "incomeTaxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductionsLabel" TEXT,
    "totalWithholding" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdRegularAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdGrossPay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdEiAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdCppAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdIncomeTaxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdOtherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdWithholding" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ytdNetPay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "generatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayStub_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayStub_employeeId_idx" ON "public"."PayStub"("employeeId");

-- CreateIndex
CREATE INDEX "PayStub_employeeId_payDate_idx" ON "public"."PayStub"("employeeId", "payDate");

-- CreateIndex
CREATE INDEX "PayStub_payDate_idx" ON "public"."PayStub"("payDate");

-- AddForeignKey
ALTER TABLE "public"."PayStub" ADD CONSTRAINT "PayStub_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
