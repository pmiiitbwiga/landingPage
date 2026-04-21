import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/lib/AuthContext';
import { UserRole } from '@/src/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Layout handles global loading
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const userRole = (user.role || (user as any).Role || (user as any).ROLE || '').toString().trim().toUpperCase();
    const isAuthorized = allowedRoles.some(role => {
      const targetRole = role.toUpperCase();
      return userRole.includes(targetRole) || targetRole.includes(userRole);
    });
    
    if (!isAuthorized) {
      console.warn(`Unauthorized access attempt by ${user.email} (Role: ${userRole}) to path: ${location.pathname}`);
      const isPrivileged = userRole.includes('ADMIN') || userRole.includes('PENGURUS');
      const redirectPath = isPrivileged ? '/admin' : '/member';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}
