import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, '', window.location.pathname);
    }
    const t = urlToken || token;
    if (t) {
      try {
        const decoded: any = jwtDecode(t);
        setUser(decoded);
      } catch { localStorage.removeItem('token'); }
    }
    setLoading(false);
  }, []);
  
  return {
    user,
    loading,
    isMerchant: user?.role === 'merchant_admin',
    isAgency: user?.role === 'agency_editor',
    isAdmin: user?.role === 'super_admin',
    isImpersonating: !!user?.impersonatedStore,
    effectiveStore: user?.impersonatedStore || user?.storeDomain,
    token: localStorage.getItem('token'),
  };
};
