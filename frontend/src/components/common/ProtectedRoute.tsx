import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  role?: string;
}

export function ProtectedRoute({ children, role }: Props) {
  const auth = useContext(AuthContext);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading LifeLine...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && auth.user?.role !== role) {
    const roleRedirects: Record<string, string> = {
      patient: '/patient',
      driver: '/driver',
      hospital_admin: '/hospital',
      super_admin: '/admin',
    };
    return <Navigate to={roleRedirects[auth.user?.role || ''] || '/'} replace />;
  }

  return <>{children}</>;
}
