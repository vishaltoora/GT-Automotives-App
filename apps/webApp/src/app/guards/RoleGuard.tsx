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
  

  // Show loading spinner while authentication is in progress
  // This includes both isLoading state AND when user/role data isn't ready yet
  if (isLoading || !user || !role) {
    // If not loading but no user/role, then redirect to login
    if (!isLoading && (!user || !role)) {
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

  if (!allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}