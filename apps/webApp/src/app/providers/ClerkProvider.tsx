import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { MockClerkProvider } from './MockClerkProvider';

// Custom domain setup - let Clerk handle JS loading automatically

// Direct import.meta.env access - Vite will replace this at build time
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Debug logging to verify env var is set
console.log('[Clerk Debug] Raw publishableKey:', publishableKey);
console.log('[Clerk Debug] publishableKey type:', typeof publishableKey);
console.log('[Clerk Debug] publishableKey length:', publishableKey?.length);
console.log('[Clerk Debug] Is empty?:', !publishableKey);

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {

  // In development without Clerk keys, use mock provider
  if (!publishableKey || publishableKey === '') {
    console.error('[Clerk Error] Publishable Key not found or empty!');
    console.error('[Clerk Error] ENV dump:', import.meta.env);
    console.warn('Clerk Publishable Key not found. Running in development mode without authentication.');
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }
  

  // Configuration for production Clerk with custom domain
  const getClerkProps = () => {
    const props: any = {
      publishableKey,
      // Use the new Clerk redirect props instead of deprecated ones
      // Let the Login component handle navigation based on role
      fallbackRedirectUrl: '/', // Default fallback, Login component will handle the actual routing
      signInFallbackRedirectUrl: '/',
      signUpFallbackRedirectUrl: '/',
      appearance: {
        elements: {
          formButtonPrimary: {
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          },
          footerActionLink: {
            color: '#1976d2'
          }
        }
      }
    };

    // Only use custom domain for production builds with production key
    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
    const isProductionKey = publishableKey?.startsWith('pk_live_');

    if (isProduction && isProductionKey && publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // Production configuration with custom domain
      props.domain = 'clerk.gt-automotives.com';

      // Disable satellite mode and set proper origins
      props.isSatellite = false;
      props.authorizedParties = ['https://gt-automotives.com', 'https://www.gt-automotives.com'];
      props.allowedRedirectOrigins = ['https://gt-automotives.com', 'https://www.gt-automotives.com'];

      // Add debugging
      console.log('[Clerk Config] Using custom domain:', props.domain);
      console.log('[Clerk Config] Production mode:', isProduction);
      console.log('[Clerk Config] Vite Mode:', import.meta.env.MODE);
      console.log('[Clerk Config] Vite PROD:', import.meta.env.PROD);
      console.log('[Clerk Config] Production key:', isProductionKey);
      console.log('[Clerk Config] Publishable key (partial):', publishableKey?.substring(0, 12) + '...');
    } else {
      // Development configuration or missing production setup
      console.log('[Clerk Config] Using development configuration');
      console.log('[Clerk Config] Production mode:', isProduction);
      console.log('[Clerk Config] Vite Mode:', import.meta.env.MODE);
      console.log('[Clerk Config] Production key:', isProductionKey);
      console.log('[Clerk Config] Publishable key (partial):', publishableKey?.substring(0, 12) + '...');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}