import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLoading } from '../../components/AuthLoading';
import { useAuth } from '../../hooks/useAuth';
import gtLogo from '../../images-and-logos/logo.png';
import { SignIn as MockSignIn } from '../../providers/MockClerkProvider';
import { colors } from '../../theme/colors';

// Use direct import.meta.env access - Vite will replace this at build time
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const SignIn = publishableKey ? ClerkSignIn : MockSignIn;


export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user, isLoading } = useAuth();

  useEffect(() => {

    // Add a small delay to avoid redirect loops during authentication state changes
    const timeoutId = setTimeout(() => {
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
          case 'supervisor':
            redirectPath = from?.startsWith('/supervisor') ? from : '/supervisor/dashboard';
            break;
          case 'staff':
            redirectPath = from?.startsWith('/staff') ? from : '/staff/dashboard';
            break;
          case 'customer':
            redirectPath = from?.startsWith('/customer')
              ? from
              : '/customer/dashboard';
            break;
        }

        navigate(redirectPath, { replace: true });
      }
    }, 100); // Small delay to prevent redirect loops

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, role, user, navigate, location, isLoading]);

  // Show loading screen immediately when authenticated (even before user data is synced)
  if (isAuthenticated) {
    const roleDisplayName =
      role === 'admin'
        ? 'Admin Panel'
        : role === 'supervisor'
        ? 'Supervisor Dashboard'
        : role === 'staff'
        ? 'Staff Dashboard'
        : 'Customer Portal';

    const message =
      user && role
        ? `Redirecting to ${roleDisplayName}...`
        : 'Verifying your account...';

    return <AuthLoading message={message} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.gradients.hero,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Box
            sx={{
              background: colors.gradients.primary,
              py: 4,
              px: 3,
              textAlign: 'center',
            }}
          >
            {/* GT Logo */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                border: `3px solid ${colors.primary.lighter}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              <img
                src={gtLogo}
                alt="GT Automotives Logo"
                style={{
                  width: '75%',
                  height: '75%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
              }}
            >
              GT Automotives
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: colors.primary.lighter,
                fontWeight: 500,
              }}
            >
              Professional Tire & Auto Services
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: colors.text.primary,
                fontWeight: 600,
                mb: 3,
              }}
            >
              Admin / Staff logins only
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <SignIn
                routing="virtual"
                signUpUrl={undefined}
                appearance={{
                  elements: {
                    rootBox: {
                      width: '100%',
                      margin: '0 auto',
                      maxWidth: '400px',
                      display: 'flex',
                      justifyContent: 'center',
                    },
                    card: {
                      boxShadow: 'none',
                      border: 'none',
                      backgroundColor: 'transparent',
                      width: '100%',
                      margin: '0',
                      padding: '16px',
                    },
                    main: {
                      width: '100%',
                      padding: '0',
                    },
                    form: {
                      gap: '20px',
                    },
                    formFieldRow: {
                      gap: '12px',
                    },
                    formField: {
                      marginBottom: '16px',
                    },
                    formFieldInput: {
                      width: '100%',
                      borderRadius: '12px',
                      border: `2px solid ${colors.neutral[200]}`,
                      fontSize: '16px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease',
                      backgroundColor: colors.background.paper,
                      '&:focus': {
                        borderColor: colors.primary.main,
                        boxShadow: `0 0 0 4px ${colors.primary.main}15`,
                        outline: 'none',
                      },
                      '&:hover': {
                        borderColor: colors.primary.light,
                      },
                    },
                    formFieldLabel: {
                      color: colors.text.primary,
                      fontWeight: 600,
                      fontSize: '14px',
                      marginBottom: '6px',
                    },
                    formButtonPrimary: {
                      width: '100%',
                      backgroundColor: colors.primary.main,
                      fontSize: '16px',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '12px',
                      padding: '16px 24px',
                      marginTop: '8px',
                      boxShadow: `0 4px 12px ${colors.primary.main}25`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: colors.primary.dark,
                        boxShadow: `0 6px 20px ${colors.primary.main}35`,
                        transform: 'translateY(-1px)',
                      },
                    },
                    dividerLine: {
                      backgroundColor: colors.neutral[200],
                      margin: '24px 0',
                    },
                    dividerText: {
                      color: colors.text.secondary,
                      fontWeight: 500,
                      fontSize: '14px',
                    },
                    socialButtonsBlockButton: {
                      width: '100%',
                      borderRadius: '12px',
                      border: `2px solid ${colors.neutral[200]}`,
                      padding: '14px 16px',
                      fontSize: '16px',
                      fontWeight: 500,
                      marginBottom: '12px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: colors.neutral[50],
                        borderColor: colors.primary.light,
                      },
                    },
                    // Hide signup elements
                    footerActionLink: {
                      display: 'none',
                    },
                    footer: {
                      display: 'none',
                    },
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    socialButtonsVariant: 'blockButton',
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            mt: 2,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 500,
          }}
        >
          Secure login powered by professional authentication
        </Typography>
      </Container>
    </Box>
  );
}
