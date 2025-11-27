-- Add appointmentId column to Invoice table
ALTER TABLE "Invoice" ADD COLUMN "appointmentId" TEXT;

-- Create unique index
CREATE UNIQUE INDEX "Invoice_appointmentId_key" ON "Invoice"("appointmentId");

-- Create index for faster lookups
CREATE INDEX "Invoice_appointmentId_idx" ON "Invoice"("appointmentId");

-- Add foreign key constraint
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_appointmentId_fkey" 
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
