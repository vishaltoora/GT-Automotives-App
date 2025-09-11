import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { MockClerkProvider } from './MockClerkProvider';
import { getEnvVar } from '../utils/env';

// Force Clerk to load JS from standard domain for custom domain setup
if (typeof window !== 'undefined') {
  (window as any).CLERK_JS_URL = 'https://clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
}

const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY');

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const navigate = useNavigate();
  
  // In development without Clerk keys, use mock provider
  if (!publishableKey) {
    console.warn('Clerk Publishable Key not found. Running in development mode without authentication.');
    return <MockClerkProvider>{children}</MockClerkProvider>;
  }

  // Configuration for production Clerk with custom domain
  const getClerkProps = () => {
    const props: any = {
      publishableKey,
      navigate: (to: string) => navigate(to),
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

    // For production key with custom domain - fix JS loading issue
    if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // Force use of standard Clerk domain for JS loading to avoid SSL errors
      // Custom domain should only handle API calls, not CDN assets
      Object.assign(props, {
        domain: 'clerk.gt-automotives.com',
        clerkJSUrl: 'https://clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js',
        allowedOrigins: ['https://clerk.accounts.dev'],
        isSatellite: false
      });
      console.log('Fixed: JS from clerk.accounts.dev, API from clerk.gt-automotives.com');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}