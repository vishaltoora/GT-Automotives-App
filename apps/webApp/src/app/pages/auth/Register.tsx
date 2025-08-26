import { Box, Container, Typography, Alert } from '@mui/material';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { SignUp as MockSignUp } from '../../providers/MockClerkProvider';

// Conditionally use Clerk or Mock SignUp based on environment
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SignUp = publishableKey ? ClerkSignUp : MockSignUp;

export function Register() {
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
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Create Your Account
        </Typography>
        <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
          Register to access your invoices, schedule appointments, and manage your vehicles.
        </Alert>
        <SignUp
          routing="path"
          path="/register"
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
          afterSignUpUrl="/customer/dashboard"
          signInUrl="/login"
        />
      </Box>
    </Container>
  );
}