-- Seed the Foreman role record. Foreman has all Admin capabilities except
-- payment and payroll access (enforced at the route/guard layer).
INSERT INTO "Role" (id, name, "displayName", description, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'FOREMAN',
  'Foreman',
  'All administrative permissions except payment and payroll access',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;
