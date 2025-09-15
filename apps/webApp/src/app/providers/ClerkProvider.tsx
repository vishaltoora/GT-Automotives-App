import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { MockClerkProvider } from './MockClerkProvider';

// Custom domain setup - let Clerk handle JS loading automatically

// Direct import.meta.env access - Vite will replace this at build time
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Debug logging in browser only
if (typeof window !== 'undefined') {
  console.log('🔍 Clerk Environment Debug - DIRECT import.meta.env:');
  console.log('📋 publishableKey (direct):', publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NOT_FOUND');
  console.log('📋 publishableKey type:', typeof publishableKey);
  console.log('📋 publishableKey length:', publishableKey?.length);
  console.log('📋 publishableKey truthy check:', !!publishableKey);
  // @ts-ignore
  console.log('📋 Raw import.meta.env.VITE_CLERK_PUBLISHABLE_KEY:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'UNDEFINED');
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
    
    console.log('🔍 ClerkProvider Decision Logic:');
    console.log('📋 publishableKey value:', publishableKey);
    console.log('📋 !publishableKey check:', !publishableKey);
    console.log('📋 Will use MockClerkProvider?', !publishableKey);
  }

  // In development without Clerk keys, use mock provider
  if (!publishableKey) {
    console.warn('Clerk Publishable Key not found. Running in development mode without authentication.');
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }
  
  console.log('✅ Using real ClerkProvider with key:', publishableKey ? `${publishableKey.substring(0, 20)}...` : 'NONE');

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