import React, { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth as useMockAuth } from './MockClerkProvider';
import { setClerkTokenGetter as setInvoiceTokenGetter } from '../services/invoice.service';
import { setClerkTokenGetter as setQuotationTokenGetter } from '../services/quotation.service';

// Check if Clerk is configured - use direct import.meta.env access for consistency
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
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