import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSuperadmin } from '../../lib/admin';
import { Sparkles } from 'lucide-react';

export const SuperadminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>Verifying administrator privileges...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isSuperadmin(user.email)) {
    return <Navigate to="/dashboard" state={{ unauthorizedAdmin: true }} replace />;
  }

  return <>{children}</>;
};
