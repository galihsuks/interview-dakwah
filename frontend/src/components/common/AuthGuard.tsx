import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../../store/auth.store';

export function AuthGuard() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
