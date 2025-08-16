import React from 'react';
import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { MockClerkProvider } from './MockClerkProvider';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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

  return (
    <ClerkProviderBase 
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
      appearance={{
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
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}