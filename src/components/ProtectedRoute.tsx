import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService, type AuthUser } from '../services/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireRole?: AuthUser['role'][];
};

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
