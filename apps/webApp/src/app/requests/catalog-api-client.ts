import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Axios client shared by the tire catalog request modules (brands, sizes,
 * locations).
 *
 * The token handling deliberately matches tire.requests.ts: ask Clerk for a
 * token on every request and treat localStorage only as a last resort. Clerk
 * hands back a cached token and refreshes it when it is close to expiring.
 *
 * The catalog modules used to do the opposite — trust localStorage first and
 * only call Clerk when nothing was stored. Clerk session tokens are short
 * lived (60s), so a stored token was routinely expired, the request 401'd, and
 * the list silently degraded to the names-only public endpoint. Those
 * name-shaped records then flowed into edit/delete as if they were ids.
 */
export const catalogApiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

catalogApiClient.interceptors.request.use(
  async (config) => {
    try {
      if (window.Clerk?.session) {
        const token = await window.Clerk.session.getToken({});
        if (token) {
          localStorage.setItem('authToken', token);
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      const stored = localStorage.getItem('authToken');
      if (stored) {
        config.headers.Authorization = `Bearer ${stored}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

catalogApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Drop the stale copy; the next request pulls a fresh one from Clerk.
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
