
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'participant';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireRole, 
  fallbackPath = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requireRole && profile.role !== requireRole) {
    const redirectPath = profile.role === 'admin' ? '/admin/dashboard' : '/participant/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
