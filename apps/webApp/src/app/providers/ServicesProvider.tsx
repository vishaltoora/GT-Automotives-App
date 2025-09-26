import React, { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth as useMockAuth } from './MockClerkProvider';
import { setClerkTokenGetter as setInvoiceTokenGetter } from '../services/invoice.service';
import { setClerkTokenGetter as setQuotationTokenGetter } from '../services/quotation.service';
import { setClerkTokenGetter as setCompanyTokenGetter } from '../services/company.service';

// Check if Clerk is configured - use direct import.meta.env access for consistency
// @ts-ignore
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const useAuth = publishableKey ? useClerkAuth : useMockAuth;

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for invoice, quotation, and company services
    if (getToken) {
      setInvoiceTokenGetter(getToken);
      setQuotationTokenGetter(getToken);
      setCompanyTokenGetter(getToken);
    }
  }, [getToken]);

  return <>{children}</>;
};