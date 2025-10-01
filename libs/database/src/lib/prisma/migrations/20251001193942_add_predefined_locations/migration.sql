/*
  Warnings:

  - You are about to drop the column `location` on the `Tire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Tire" DROP COLUMN "location",
ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "public"."Location"("name");

-- AddForeignKey
ALTER TABLE "public"."Tire" ADD CONSTRAINT "Tire_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert predefined locations with manually generated CUIDs
INSERT INTO "public"."Location" (id, name, "createdAt", "updatedAt") VALUES
  ('cl9q7x2m80000xyz', 'Johny''s Shed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cl9q7x2m80001xyz', 'Gill''s House', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cl9q7x2m80002xyz', 'Monika''s House', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cl9q7x2m80003xyz', 'Wherehouse', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
