-- AlterTable
ALTER TABLE "public"."PayStub" ADD COLUMN     "vacationPayBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vacationPayPaidOut" DECIMAL(10,2) NOT NULL DEFAULT 0;
