-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "timeClockClosesAt" TEXT NOT NULL DEFAULT '20:00',
ADD COLUMN     "timeClockOpensAt" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "timeClockWindowEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."TimeEntry" ADD COLUMN     "autoClockedOut" BOOLEAN NOT NULL DEFAULT false;
