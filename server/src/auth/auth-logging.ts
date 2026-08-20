/**
 * Verbose authentication logging is opt-in via `AUTH_DEBUG=true`.
 *
 * Deliberately not tied to NODE_ENV: local development runs with
 * NODE_ENV=development and would still flood the console, and the data these
 * logs carry (decoded JWT claims, Clerk user objects) does not belong on disk
 * by default in any environment.
 *
 * Read at call time rather than module load so it can be toggled in tests.
 */
export function isAuthDebugEnabled(): boolean {
  return process.env.AUTH_DEBUG === 'true';
}
