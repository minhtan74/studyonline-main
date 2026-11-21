import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/** Tương đương <header class="s-header"> — avatar + toggle sidebar, dùng chung mọi trang student */
export default function StudentHeader({ onToggleSidebar }) {
  const { user } = useAuth();

  // Avatar = chữ cái đầu của 2 từ cuối trong tên; tên hiển thị = từ cuối (tên gọi)
  const initials = user?.fullname
    ? user.fullname
      .split(' ')
      .map((w) => w[0])
      .slice(-2)
      .join('')
      .toUpperCase()
    : '?';
  const displayName = user?.fullname?.split(' ').pop() || 'Học viên';

  return (
    <header className="s-header">
      <button className="s-toggle-btn" id="sidebarToggle" title="Toggle sidebar" onClick={onToggleSidebar}>
        ☰
      </button>
      <div className="s-header-actions">
        {/* Bấm avatar mở trang hồ sơ cá nhân. */}
        <Link className="s-avatar-wrap" id="avatarWrap" to="/student/profile" aria-label="Mở hồ sơ cá nhân" title="Hồ sơ cá nhân" style={{ textDecoration: 'none' }}>
          <div className="s-avatar" id="headerAvatar">
            {initials}
          </div>
          <span className="s-avatar-name" id="headerName">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}
