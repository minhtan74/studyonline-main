import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Thay cho requireLogin() + IIFE kiểm tra role trong các trang admin/teacher/quiz-questions cũ.
 * - Chưa đăng nhập -> /login
 * - Sai role -> wrongRoleRedirect (mặc định /login, giống bản gốc)
 */
export default function ProtectedRoute({ roles, wrongRoleRedirect = '/login', alertOnWrongRole, children }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    if (alertOnWrongRole) window.alert(alertOnWrongRole);
    return <Navigate to={wrongRoleRedirect} replace />;
  }

  return children ?? <Outlet />;
}
