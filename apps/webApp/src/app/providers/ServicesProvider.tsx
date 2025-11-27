import React, { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuth as useMockAuth } from './MockClerkProvider';
import { setClerkTokenGetter as setInvoiceTokenGetter } from '../requests/invoice.requests';
import { setClerkTokenGetter as setQuotationTokenGetter } from '../requests/quotation.requests';
import { setClerkTokenGetter as setCompanyTokenGetter } from '../requests/company.requests';
import { setClerkTokenGetter as setUserTokenGetter } from '../requests/user.requests';
import { setClerkTokenGetter as setJobTokenGetter } from '../requests/job.requests';
import { setClerkTokenGetter as setPaymentTokenGetter } from '../requests/payment.requests';

// Check if Clerk is configured - use direct import.meta.env access for consistency
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const useAuth = publishableKey ? useClerkAuth : useMockAuth;

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for all services
    if (getToken) {
      setInvoiceTokenGetter(getToken);
      setQuotationTokenGetter(getToken);
      setCompanyTokenGetter(getToken);
      setUserTokenGetter(getToken);
      setJobTokenGetter(getToken);
      setPaymentTokenGetter(getToken);
    }
  }, [getToken]);

  return <>{children}</>;
};