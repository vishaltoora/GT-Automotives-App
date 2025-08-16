import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, Container, Typography } from '@mui/material';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { SignIn as MockSignIn } from '../../providers/MockClerkProvider';

// Conditionally use Clerk or Mock SignIn based on environment
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SignIn = publishableKey ? ClerkSignIn : MockSignIn;

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role) {
      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'customer':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, role, navigate]);

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