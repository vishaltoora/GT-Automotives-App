import { getAuthToken } from './auth';

// setupAxiosInterceptors is intentionally not tested: it requires axios and only
// registers side-effecting interceptors, which would need heavy network mocking.
//
// getAuthToken is testable in the deterministic branch: when no Clerk instance is
// present on window (window.__clerk undefined), it falls back to the localStorage
// 'authToken' value. (VITE_CLERK_PUBLISHABLE_KEY is seeded by test-setup, so the
// Clerk branch is entered but finds no session and proceeds to the fallback.)
describe('auth getAuthToken', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as any).__clerk;
  });

  afterEach(() => {
    localStorage.clear();
    delete (window as any).__clerk;
  });

  it('returns the localStorage authToken when no Clerk session exists', async () => {
    localStorage.setItem('authToken', 'local-token-123');
    await expect(getAuthToken()).resolves.toBe('local-token-123');
  });

  it('returns null when there is no token anywhere', async () => {
    await expect(getAuthToken()).resolves.toBeNull();
  });

  it('returns the Clerk session token when a Clerk session is available', async () => {
    (window as any).__clerk = {
      session: {
        getToken: () => Promise.resolve('clerk-token-abc'),
      },
    };
    await expect(getAuthToken()).resolves.toBe('clerk-token-abc');
  });

  it('falls back to localStorage if Clerk token retrieval throws', async () => {
    localStorage.setItem('authToken', 'fallback-token');
    (window as any).__clerk = {
      session: {
        getToken: () => Promise.reject(new Error('boom')),
      },
    };
    await expect(getAuthToken()).resolves.toBe('fallback-token');
  });
});
