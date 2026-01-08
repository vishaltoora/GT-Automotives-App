-- Add ACCOUNTANT role to RoleName enum
ALTER TYPE "RoleName" ADD VALUE 'ACCOUNTANT';

-- Insert the Accountant role into the Role table
INSERT INTO "Role" (id, name, "displayName", description, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'ACCOUNTANT', 'Accountant', 'Accountant with access to invoices, reports, and expense management', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
