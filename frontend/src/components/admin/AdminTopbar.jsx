import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Tương đương <header class="topbar"> trong _legacy/pages/admin/dashboard.html.
 * Bản gốc đặt breadcrumb trong .page-header của main-content (không phải topbar);
 * theo yêu cầu của bản chuyển đổi này, breadcrumb được tính từ route hiện tại và
 * hiển thị ở đây — mỗi trang admin vẫn có breadcrumb/tiêu đề riêng trong
 * .page-header của chính nó để giữ đúng bố cục gốc, nên có một chút lặp lại
 * (chấp nhận được vì ưu tiên đúng chức năng hơn là khớp pixel breadcrumb).
 */
const BREADCRUMB_BY_PATH = {
  '/admin': 'Dashboard',
  '/admin/users': 'Quản lý User',
  '/admin/teachers': 'Quản lý User',
  '/admin/students': 'Quản lý User',
  '/admin/courses': 'Quản lý Khóa học',
  '/admin/stats': 'STATS',
  '/admin/reports': 'REPORTS',
  '/admin/settings': 'SETTINGS',
};

export default function AdminTopbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const fullname = user?.fullname || 'Admin';
  const initials = fullname
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  const displayName = fullname.split(' ').pop() || 'Admin';
  const breadcrumbCurrent = BREADCRUMB_BY_PATH[location.pathname] || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn-icon sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Mở/đóng menu"
        >
          ☰
        </button>
        <div>
          <h2 className="topbar-title">Hệ thống Quản trị</h2>
          <span className="topbar-sub">Xin chào, {displayName}!</span>
          <div className="breadcrumb" style={{ marginTop: '0.25rem' }}>
            <Link to="/admin">Admin</Link> / <span>{breadcrumbCurrent}</span>
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}
