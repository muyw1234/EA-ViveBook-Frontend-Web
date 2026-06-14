import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useSessionToken } from '../hooks/useSessionToken';

export default function ProtectedRoute() {
  const token = useSessionToken();

  useEffect(() => {
    if (!token && !sessionStorage.getItem('session-reason')) {
      toast.warn('Debes iniciar sesión para acceder a esta sección');
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
