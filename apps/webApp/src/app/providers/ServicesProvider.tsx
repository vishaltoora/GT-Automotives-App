import React, { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth as useMockAuth } from './MockClerkProvider';
import { setClerkTokenGetter } from '../services/invoice.service';

// Check if Clerk is configured
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const useAuth = publishableKey ? useClerkAuth : useMockAuth;

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for invoice service
    if (getToken) {
      setClerkTokenGetter(getToken);
    }
  }, [getToken]);

  return <>{children}</>;
};