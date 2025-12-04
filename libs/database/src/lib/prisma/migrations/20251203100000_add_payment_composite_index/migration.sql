-- CreateIndex: Add composite index for Payment paidAt + status
-- This index was missing from migrations (existed in schema via db push)
-- Used for EOD summaries and daily cash flow reports
CREATE INDEX IF NOT EXISTS "Payment_paidAt_status_idx" ON "Payment"("paidAt", "status");
