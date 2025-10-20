-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('AT_GARAGE', 'MOBILE_SERVICE');

-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "appointmentType" "public"."AppointmentType" NOT NULL DEFAULT 'AT_GARAGE';
