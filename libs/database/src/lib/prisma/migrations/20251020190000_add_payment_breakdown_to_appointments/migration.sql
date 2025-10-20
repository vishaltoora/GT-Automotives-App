-- AlterTable: Replace paymentMethod with paymentBreakdown JSON
-- First, migrate existing data from paymentMethod to paymentBreakdown
UPDATE "Appointment"
SET "paymentBreakdown" = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'method', "paymentMethod",
    'amount', COALESCE("paymentAmount", 0)
  )
)
WHERE "paymentMethod" IS NOT NULL AND "paymentAmount" IS NOT NULL;

-- Drop the old paymentMethod column
ALTER TABLE "Appointment" DROP COLUMN "paymentMethod";

-- Add paymentBreakdown column if it doesn't exist (in case migration partially ran)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Appointment' AND column_name = 'paymentBreakdown'
  ) THEN
    ALTER TABLE "Appointment" ADD COLUMN "paymentBreakdown" JSONB;
  END IF;
END $$;
