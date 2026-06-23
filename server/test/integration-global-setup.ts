/* eslint-disable */
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Global setup for backend integration tests.
 *
 * Applies the Prisma schema to the test database before any integration spec
 * runs. Requires DATABASE_URL to point at a *test* Postgres database (never the
 * dev or production DB). Locally, spin one up with:
 *
 *   docker compose -f docker-compose.test.yml up -d
 *
 * In CI, a Postgres service container provides the database.
 */
export default async function () {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Integration tests need a test Postgres database.\n' +
        'Run `yarn test:integration:local` (starts docker-compose.test.yml) or set DATABASE_URL manually.'
    );
  }

  if (
    /gt_automotive(\?|$|"|\s)/.test(databaseUrl) &&
    !/test/i.test(databaseUrl)
  ) {
    throw new Error(
      `Refusing to run integration tests against a non-test database: ${databaseUrl}\n` +
        'The database name must contain "test" as a safety guard.'
    );
  }

  const workspaceRoot = path.resolve(__dirname, '..', '..');
  const schemaPath = path.join(
    workspaceRoot,
    'libs/database/src/lib/prisma/schema.prisma'
  );

  // eslint-disable-next-line no-console
  console.log('\n[integration] Applying migrations to test database...');
  execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
