import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ImpersonationBanner } from './ImpersonationBanner';

export const RequireAuth = ({ roles, children }: { roles: string[], children: any }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/login" />;
  return (
    <>
      {user.impersonatedStore && <ImpersonationBanner store={user.impersonatedStore} />}
      {children}
    </>
  );
};

export const RequireAdmin = ({ children }: { children: any }) => {
  return <RequireAuth roles={['super_admin']}>{children}</RequireAuth>;
};
