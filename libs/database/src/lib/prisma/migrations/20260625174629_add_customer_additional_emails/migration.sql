-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "additionalEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];
