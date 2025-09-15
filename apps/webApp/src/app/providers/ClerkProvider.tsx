import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { MockClerkProvider } from './MockClerkProvider';
import { getEnvVar } from '../utils/env';

// Custom domain setup - let Clerk handle JS loading automatically

// TEMPORARY: Hardcode the key to test - THIS WILL BE FIXED
const publishableKey = 'pk_live_Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA';

// Debug logging in browser only
if (typeof window !== 'undefined') {
  console.log('🔍 Clerk Environment Debug - HARDCODED KEY TEST:');
  console.log('📋 publishableKey (hardcoded):', publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT_FOUND');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  // Debug logging for production troubleshooting
  if (typeof window !== 'undefined') {
    console.log('🔍 Clerk Environment Debug:', {
      publishableKey: publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT_FOUND',
      nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown'
    });
  }

  // In development without Clerk keys, use mock provider
  if (!publishableKey) {
    console.warn('Clerk Publishable Key not found. Running in development mode without authentication.');
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }

  // Configuration for production Clerk with custom domain
  const getClerkProps = () => {
    const props: any = {
      publishableKey,
      // Remove navigate prop to let Clerk handle its own navigation
      // This prevents unwanted page reloads during authentication
      afterSignInUrl: '/login', // Redirect here after sign in for role-based routing
      afterSignUpUrl: '/login',
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

    // For production key with verified custom domain
    if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // DNS verified - use custom domain with SSL certificates
      props.domain = 'clerk.gt-automotives.com';
      props.isSatellite = false;
      console.log('Using verified custom domain: clerk.gt-automotives.com');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}