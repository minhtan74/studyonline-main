import { Link, NavLink } from 'react-router-dom';

const navClass = ({ isActive }) => 's-nav-item' + (isActive ? ' active' : '');

/** Tương đương <aside class="s-sidebar"> trong các trang student cũ */
export default function StudentSidebar({ collapsed, mobileOpen }) {

  return (
    <aside
      className={`s-sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
      id="studentSidebar"
    >
      <Link className="s-sidebar-logo" to="/">
        <div className="logo-icon">🎓</div>
        <span className="logo-text">StudyOnline</span>
      </Link>
      <nav className="s-sidebar-nav">
        <NavLink className={navClass} to="/student/dashboard">
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>
        <NavLink className={navClass} to="/student/my-courses">
          <span className="nav-icon">📚</span>
          <span className="nav-label">Khóa học của tôi</span>
        </NavLink>
        <NavLink className={navClass} to="/student/courses">
          <span className="nav-icon">🌐</span>
          <span className="nav-label">Khám phá</span>
        </NavLink>
        <NavLink className={navClass} to="/student/progress">
          <span className="nav-icon">📈</span>
          <span className="nav-label">Tiến độ học tập</span>
        </NavLink>
        <NavLink className={navClass} to="/quiz">
          <span className="nav-icon">📝</span>
          <span className="nav-label">Quiz</span>
        </NavLink>

      </nav>
    </aside>
  );
}
