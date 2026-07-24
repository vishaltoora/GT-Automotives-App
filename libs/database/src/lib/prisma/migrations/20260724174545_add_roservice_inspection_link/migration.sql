-- AlterTable
ALTER TABLE "public"."ro_services" ADD COLUMN     "inspectionId" TEXT;

-- CreateIndex
CREATE INDEX "ro_services_inspectionId_idx" ON "public"."ro_services"("inspectionId");
