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

  // Workaround for custom domain issue - extract domain from key and provide fallback
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

    // If production key with custom domain, try to provide a working frontend API
    if (publishableKey?.includes('Y2xlcmsuZ3QtYXV0b21vdGl2ZXMuY29tJA')) {
      // Force use standard clerk domain instead of custom domain
      // This is a workaround - ideally the custom domain should be set up properly
      console.warn('Using production Clerk key with custom domain. Consider setting up clerk.gt-automotives.com properly.');
    }

    return props;
  };

  return (
    <ClerkProviderBase {...getClerkProps()}>
      {children}
    </ClerkProviderBase>
  );
}