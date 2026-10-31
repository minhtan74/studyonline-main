import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/css/public-footer.css';

const WORKSPACES = {
  student: { path:'/student/dashboard', label:'Góc học tập của tôi' },
  teacher: { path:'/teacher', label:'Khu vực giảng viên' },
  admin: { path:'/admin', label:'Trang quản trị' },
};

export default function Footer() {
  const { user } = useAuth();
  const workspace = WORKSPACES[user?.role];
  return <footer className="public-footer" aria-label="Thông tin và hỗ trợ StudyOnline">
    <div className="public-footer-inner">
      <div className="public-footer-grid">
        <div className="public-footer-brand">
          <h2><Link to="/" aria-label="StudyOnline — Trang chủ">🎓 StudyOnline</Link></h2>
          <p>Nền tảng học tập trực tuyến cho sinh viên và người đi làm.</p>
          <p>Học theo chương, bài; xem tài liệu, luyện Quiz và theo dõi tiến độ. AI Tutor hỗ trợ giải đáp dựa trên tài liệu khóa học.</p>
        </div>
        <nav className="public-footer-links" aria-label="Liên kết nền tảng">
          <h2>Liên kết</h2>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/courses">Khóa học</Link></li>
            <li><Link to="/help">Hướng dẫn sử dụng</Link></li>
            {workspace ? <li><Link to={workspace.path}>{workspace.label}</Link></li> : <>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký tài khoản</Link></li>
            </>}
          </ul>
        </nav>
        <div className="public-footer-support">
          <h2>Liên hệ &amp; hỗ trợ</h2>
          <p>Liên hệ quản trị viên quản lý hệ thống qua kênh của lớp hoặc đơn vị bạn đang học.</p>
          <p>Khi cần hỗ trợ, cung cấp email đăng ký, tên khóa học và mô tả vấn đề; không gửi mật khẩu hoặc mã OTP.</p>
          <ul>
            <li><Link to="/forgot-password">Hướng dẫn cấp lại mật khẩu</Link></li>
            <li><Link to="/help#support">Thông tin hỗ trợ chi tiết</Link></li>
          </ul>
        </div>
      </div>
      <div className="public-footer-bottom">© {new Date().getFullYear()} StudyOnline. Nền tảng học tập trực tuyến.</div>
    </div>
  </footer>;
}
