-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_bookedBy_fkey" FOREIGN KEY ("bookedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
