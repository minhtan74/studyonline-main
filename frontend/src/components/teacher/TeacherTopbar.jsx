import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function getInitials(fullname) {
  if (!fullname) return 'TC';
  return fullname
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Tương đương breadcrumb.textContent = viewName... trong switchView() bản gốc,
// suy ra từ route path thay vì window.location.hash.
const BREADCRUMB_BY_PATH = [
  [/^\/teacher\/courses/, 'Courses'],
  [/^\/teacher\/chapters/, 'Chapters'],
  [/^\/teacher\/lessons/, 'Lessons'],
  [/^\/teacher\/quizzes\/.+\/questions/, 'Câu hỏi Quiz'],
  [/^\/teacher\/quizzes/, 'Quizzes'],
  [/^\/teacher\/students/, 'Students'],
  [/^\/teacher\/stats/, 'Stats'],
  [/^\/teacher\/profile/, 'Profile'],
];

function getBreadcrumb(pathname) {
  const match = BREADCRUMB_BY_PATH.find(([re]) => re.test(pathname));
  return match ? match[1] : 'Dashboard';
}

/** Tương đương <header class="topbar"> của teacher/dashboard.html cũ */
export default function TeacherTopbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  const name = user?.fullname || 'Instructor';
  const initials = getInitials(name);
  const breadcrumb = getBreadcrumb(location.pathname);

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
          <h2 className="topbar-title">Hệ thống Giảng viên</h2>
          <span className="topbar-sub">Xin chào, {name}!</span>
          <span className="breadcrumb" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
            <span>Instructor</span> / <span>{breadcrumb}</span>
          </span>
        </div>
      </div>
      <div className="topbar-right">
        <button className="btn-icon" type="button">
          💬
          <span className="notif-dot" style={{ background: 'var(--primary)' }}></span>
        </button>
        <button className="btn-icon notif-btn" type="button">
          🔔
          <span className="notif-dot"></span>
        </button>
        <div className="topbar-avatar">{initials}</div>
      </div>
    </header>
  );
}
