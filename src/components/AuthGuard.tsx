import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin_token');
      const expiry = localStorage.getItem('admin_token_expiry');

      if (!token || !expiry) {
        setIsAuthenticated(false);
        return;
      }

      const expiryTime = parseInt(expiry, 10);
      if (new Date().getTime() > expiryTime) {
        // Token expired
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token_expiry');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-400 font-mono animate-pulse">Initializing Security Protocol...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
