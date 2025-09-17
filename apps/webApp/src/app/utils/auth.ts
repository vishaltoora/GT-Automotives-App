import { getEnvVar } from './env';

// Get current auth token for API requests
export async function getAuthToken(): Promise<string | null> {
  const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY');
  
  if (publishableKey) {
    // Use Clerk in production
    try {
      // We need to get the token from the current Clerk context
      // This is a bit tricky since we can't use hooks outside components
      // For now, let's try to get it from the window object if available
      const clerkInstance = (window as any).__clerk;
      if (clerkInstance && clerkInstance.session) {
        return await clerkInstance.session.getToken();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting Clerk token:', error);
      }
    }
  }
  
  // Fallback to localStorage token (for development/testing)
  return localStorage.getItem('authToken');
}

// Set up axios interceptor to automatically add auth headers
export function setupAxiosInterceptors() {
  const axios = require('axios').default;
  
  // Request interceptor to add auth header
  axios.interceptors.request.use(
    async (config: any) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        if (import.meta.env.DEV) {
          console.warn('Unauthorized access - token may be expired');
        }
        // Could trigger logout or token refresh here
      }
      return Promise.reject(error);
    }
  );
}