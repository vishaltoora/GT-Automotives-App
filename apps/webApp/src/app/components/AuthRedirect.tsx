import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLoading } from './AuthLoading';

/**
 * AuthRedirect component handles redirecting authenticated users
 * away from public pages to their appropriate dashboards
 */
export function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if:
    // 1. Not loading
    // 2. User is authenticated
    // 3. User has a role
    // 4. Currently on a public page (not already on a protected route)
    if (!isLoading && isAuthenticated && user && role) {
      const currentPath = location.pathname;

      // Define public paths that should redirect authenticated users
      const publicPaths = [
        '/',
        '/login',
        '/register',
        '/services',
        '/products',
        '/about',
        '/contact',
      ];

      // Only redirect if on a public path
      if (publicPaths.includes(currentPath)) {
        let redirectPath = '/';

        switch (role.toLowerCase()) {
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'foreman':
            redirectPath = '/foreman/dashboard';
            break;
          case 'supervisor':
            redirectPath = '/supervisor/dashboard';
            break;
          case 'staff':
            redirectPath = '/staff/dashboard';
            break;
          // Customer portal disabled — customers stay on the public site.
          case 'customer':
            return;
          default:
            console.warn('Unknown role:', role);
            return;
        }

        // Show loading screen before redirect
        setIsRedirecting(true);

        // Delay redirect slightly for smooth animation
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1500); // 1.5 second delay for animation
      }
    }
  }, [isAuthenticated, role, user, isLoading, location.pathname, navigate]);

  // Show loading screen during redirect OR if we're about to redirect
  const currentPath = location.pathname;
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/services',
    '/products',
    '/about',
    '/contact',
  ];
  const isOnPublicPage = publicPaths.includes(currentPath);

  // Show loading immediately when authenticated user is detected on public page
  // Even if user data isn't fully loaded yet. Customers are not redirected
  // (portal disabled), so they should never see the loading screen.
  const roleWillRedirect =
    !role ||
    ['admin', 'foreman', 'supervisor', 'staff'].includes(
      (role || '').toLowerCase()
    );
  const shouldShowLoading =
    isRedirecting || (isAuthenticated && isOnPublicPage && roleWillRedirect);

  if (shouldShowLoading) {
    const roleDisplayName =
      role === 'admin'
        ? 'Admin Panel'
        : role === 'foreman'
        ? 'Foreman Dashboard'
        : role === 'supervisor'
        ? 'Supervisor Dashboard'
        : role === 'staff'
        ? 'Staff Dashboard'
        : 'Customer Portal';

    const message = isRedirecting
      ? `Redirecting to ${roleDisplayName}...`
      : role
      ? `Loading ${roleDisplayName}...`
      : 'Verifying your account...';

    return <AuthLoading message={message} />;
  }

  // This component doesn't render anything when not redirecting
  return null;
}
