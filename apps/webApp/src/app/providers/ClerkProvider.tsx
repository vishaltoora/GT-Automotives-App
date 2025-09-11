import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { MockClerkProvider } from './MockClerkProvider';
import { getEnvVar } from '../utils/env';

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

    // For production key with custom domain, force use of standard Clerk domain
    if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // Override Clerk's domain detection to prevent loading JS from custom domain
      // Custom domain should only be used for API calls, not JS files
      props.clerkJSUrl = 'https://clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
      props.domain = 'clerk.accounts.dev';
      props.isSatellite = false;
      console.log('Fixed Clerk custom domain - using standard domain for JS loading');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}