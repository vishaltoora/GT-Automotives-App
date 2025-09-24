import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { MockClerkProvider } from './MockClerkProvider';

// Custom domain setup - let Clerk handle JS loading automatically

// Direct import.meta.env access - Vite will replace this at build time
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';


interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {

  // In development without Clerk keys, use mock provider
  if (!publishableKey) {
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
    const isProduction = import.meta.env.PROD;
    const isProductionKey = publishableKey?.startsWith('pk_live_');

    if (isProduction && isProductionKey && publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // DNS verified - use custom domain with SSL certificates
      props.domain = 'clerk.gt-automotives.com';
      props.isSatellite = false;
      // Critical for cross-device authentication - prevents subdomain cookie leaking
      props.authorizedParties = ['https://gt-automotives.com', 'https://www.gt-automotives.com'];
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}