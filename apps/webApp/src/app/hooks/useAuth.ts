import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser as useClerkUser, useAuth as useClerkAuthHook } from '@clerk/clerk-react';
import { useUser as useMockUser, useAuth as useMockAuth } from '../providers/MockClerkProvider';

// Conditionally use Clerk or Mock hooks based on environment
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const useUser = publishableKey ? useClerkUser : useMockUser;
const useClerkAuth = publishableKey ? useClerkAuthHook : useMockAuth;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UserRole {
  id: number;
  name: string;
}

interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export function useAuth() {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use Clerk hooks
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  
  // Development mode bypass - for testing without backend
  const isDevelopment = import.meta.env.DEV && !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    const syncUser = async () => {
      // Development mode with mock data
      if (isDevelopment) {
        // Simulate a logged-in customer user for development
        const mockUser: AppUser = {
          id: 'dev-user-1',
          email: 'customer@example.com',
          firstName: 'Test',
          lastName: 'Customer',
          role: {
            id: 3,
            name: 'customer'
          },
          isActive: true
        };
        setAppUser(mockUser);
        setLoading(false);
        return;
      }
      
      if (!isLoaded) {
        setLoading(true);
        return;
      }
      
      if (isSignedIn && clerkUser) {
        try {
          setLoading(true);
          const token = await getToken();
          
          // First check if user exists in our database
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAppUser(response.data);
        } catch (error: any) {
          console.error('Failed to sync user:', error);
          
          // If user doesn't exist in our database, create them via webhook
          if (error.response?.status === 404) {
            try {
              // Trigger user creation via webhook simulation
              const token = await getToken();
              const createResponse = await axios.post(
                `${API_URL}/api/auth/sync`,
                {
                  clerkId: clerkUser.id,
                  email: clerkUser.primaryEmailAddress?.emailAddress,
                  firstName: clerkUser.firstName || '',
                  lastName: clerkUser.lastName || '',
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              setAppUser(createResponse.data);
            } catch (createError) {
              console.error('Failed to create user:', createError);
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        setAppUser(null);
        setLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, isLoaded, isSignedIn, getToken, isDevelopment]);

  return {
    user: appUser,
    clerkUser,
    isAuthenticated: isDevelopment ? true : isSignedIn,
    isLoading: loading || (!isDevelopment && !isLoaded),
    role: appUser?.role?.name || null,
    isAdmin: appUser?.role?.name === 'admin',
    isStaff: appUser?.role?.name === 'staff',
    isCustomer: appUser?.role?.name === 'customer',
  };
}