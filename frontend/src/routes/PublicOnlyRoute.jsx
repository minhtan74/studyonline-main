import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Thay cho redirectIfLoggedIn() — dùng trên /login và /register */
export default function PublicOnlyRoute({ children }) {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn) {
    const role = user?.role;
    const target = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student/dashboard';
    return <Navigate to={target} replace />;
  }

  return children ?? <Outlet />;
}
