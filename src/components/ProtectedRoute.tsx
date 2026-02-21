import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/admin-login', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user && user.username) {
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid');
      }
    } catch {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}