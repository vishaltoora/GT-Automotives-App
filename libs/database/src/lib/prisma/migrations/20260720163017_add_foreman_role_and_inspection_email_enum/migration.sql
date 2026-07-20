-- Add the FOREMAN role and INSPECTION_REPORT email type enum values.
-- Enum value additions are kept in their own migration so they are committed
-- before any statement that references them (Postgres requirement).
ALTER TYPE "RoleName" ADD VALUE IF NOT EXISTS 'FOREMAN';
ALTER TYPE "EmailType" ADD VALUE IF NOT EXISTS 'INSPECTION_REPORT';
