import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/unauthorized'
}: RoleGuardProps) {
  const { user, role, isLoading } = useAuth();

  console.log('[RoleGuard] Debug:', {
    role,
    allowedRoles,
    user: user?.email,
    isLoading,
    hasUser: !!user,
    hasRole: !!role,
  });

  // Show loading spinner while authentication is in progress
  // This includes both isLoading state AND when user/role data isn't ready yet
  if (isLoading || !user || !role) {
    // If not loading but no user/role, then redirect to login
    if (!isLoading && (!user || !role)) {
      console.log('[RoleGuard] Redirecting to login - no user or role');
      return <Navigate to="/login" replace />;
    }

    // Otherwise show loading spinner
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
  const normalizedUserRole = role.toLowerCase();
  const isAllowed = normalizedAllowedRoles.includes(normalizedUserRole);

  console.log('[RoleGuard] Authorization check:', {
    normalizedAllowedRoles,
    normalizedUserRole,
    isAllowed,
  });

  if (!isAllowed) {
    console.log('[RoleGuard] Access DENIED - redirecting to', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[RoleGuard] Access GRANTED');
  return <>{children}</>;
}