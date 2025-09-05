import React, { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth as useMockAuth } from './MockClerkProvider';
import { setClerkTokenGetter as setInvoiceTokenGetter } from '../services/invoice.service';
import { setClerkTokenGetter as setQuotationTokenGetter } from '../services/quotation.service';
import { getEnvVar } from '../utils/env';

// Check if Clerk is configured
const publishableKey = getEnvVar('VITE_CLERK_PUBLISHABLE_KEY');
const useAuth = publishableKey ? useClerkAuth : useMockAuth;

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for invoice and quotation services
    if (getToken) {
      setInvoiceTokenGetter(getToken);
      setQuotationTokenGetter(getToken);
    }
  }, [getToken]);

  return <>{children}</>;
};