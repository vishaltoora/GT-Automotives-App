-- AlterTable
ALTER TABLE "public"."EmployeeCompensation" ADD COLUMN     "vacationPayRate" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."PayStub" ADD COLUMN     "vacationPayAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vacationPayHeld" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vacationPayRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "ytdVacationPayAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "ytdVacationPayHeld" DECIMAL(10,2) NOT NULL DEFAULT 0;
