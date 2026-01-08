-- AlterTable: Replace paymentMethod with paymentBreakdown JSON
-- First, add paymentBreakdown column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Appointment' AND column_name = 'paymentBreakdown'
  ) THEN
    ALTER TABLE "Appointment" ADD COLUMN "paymentBreakdown" JSONB;
  END IF;
END $$;

-- Then migrate existing data from paymentMethod to paymentBreakdown
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Appointment' AND column_name = 'paymentMethod'
  ) THEN
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
  END IF;
END $$;
