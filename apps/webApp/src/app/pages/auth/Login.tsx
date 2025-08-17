import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Typography } from '@mui/material';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { SignIn as MockSignIn } from '../../providers/MockClerkProvider';

// Conditionally use Clerk or Mock SignIn based on environment
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SignIn = publishableKey ? ClerkSignIn : MockSignIn;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if authenticated AND has a synced user with role
    // And we're not in a loading state
    if (!isLoading && isAuthenticated && user && role) {
      // Get the page they were trying to access, if any
      const from = location.state?.from?.pathname || null;
      
      // Determine where to redirect based on role
      let redirectPath = '/';
      switch (role) {
        case 'admin':
          redirectPath = from?.startsWith('/admin') ? from : '/admin/dashboard';
          break;
        case 'staff':
          redirectPath = from?.startsWith('/staff') ? from : '/staff/dashboard';
          break;
        case 'customer':
          redirectPath = from?.startsWith('/customer') ? from : '/customer/dashboard';
          break;
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, role, user, navigate, location, isLoading]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
          GT Automotive - Sign In
        </Typography>
        <SignIn
          routing="path"
          path="/login"
          appearance={{
            elements: {
              rootBox: {
                width: '100%',
              },
              formButtonPrimary: {
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }
            },
          }}
          signUpUrl="/register"
        />
      </Box>
    </Container>
  );
}