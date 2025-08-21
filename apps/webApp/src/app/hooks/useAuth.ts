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
  const isDevelopment = false; // Disabled since we have Clerk keys now

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
          
          if (!token) {
            // User is signed in with Clerk but no token yet
            // This happens on first sign-in before backend sync
            console.log('Waiting for Clerk token...');
            setLoading(false);
            return;
          }
          
          // First check if user exists in our database
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAppUser(response.data);
        } catch (error: any) {
          console.error('Failed to sync user:', error);
          
          // For now, set a default customer user to prevent redirect loops
          // The proper sync should happen via Clerk webhook
          if (error.response?.status === 404 || error.response?.status === 401) {
            console.log('User not found in database. Checking for pre-seeded user...');
            
            // Check if this is Vishal's account
            const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
            if (userEmail === 'vishal.alawalpuria@gmail.com') {
              // This is Vishal - should be admin
              setAppUser({
                id: clerkUser.id,
                email: userEmail,
                firstName: clerkUser.firstName || 'Vishal',
                lastName: clerkUser.lastName || 'Toora',
                role: { id: 1, name: 'admin' }, // Admin role
                isActive: true
              });
            } else {
              // Default to customer role for other users
              setAppUser({
                id: clerkUser.id,
                email: userEmail,
                firstName: clerkUser.firstName || 'User',
                lastName: clerkUser.lastName || '',
                role: { id: 3, name: 'customer' }, // Default to customer role
                isActive: true
              });
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
    role: appUser?.role?.name?.toLowerCase() || null,
    isAdmin: appUser?.role?.name?.toLowerCase() === 'admin',
    isStaff: appUser?.role?.name?.toLowerCase() === 'staff',
    isCustomer: appUser?.role?.name?.toLowerCase() === 'customer',
  };
}