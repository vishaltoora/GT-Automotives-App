-- Add ACCOUNTANT role to RoleName enum
-- Note: This must be committed before using the new enum value
ALTER TYPE "RoleName" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
