import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PANEL_BY_ROLE = {
  admin: { to: '/admin', label: 'Admin Panel' },
  teacher: { to: '/teacher', label: 'Teacher Panel' },
  student: { to: '/student/dashboard', label: 'Dashboard' },
};

/** Tương đương renderNavbar() (bản Tailwind) trong api.js — dùng cho Home/Login/Register/Courses */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const panel = user?.role ? PANEL_BY_ROLE[user.role] : null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav id="navbar" className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-1">
          <Link to="/" className="text-blue-600 font-extrabold text-xl flex items-center gap-2">
            🎓 <span className="text-slate-900">StudyOnline</span>
          </Link>
          <Link
            to="/"
            className="ml-4 text-slate-600 hover:text-blue-600 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
          >
            Trang chủ
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {panel && (
            <Link
              to={panel.to}
              className="text-slate-600 hover:text-blue-600 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
            >
              {panel.label}
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-sm rounded-lg transition-all"
            >
              Đăng xuất ({user.fullname?.split(' ').pop()})
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm rounded-lg transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm rounded-lg transition-all shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
