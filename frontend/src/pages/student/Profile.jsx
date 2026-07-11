import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';

const ROLE_LABELS = { admin: 'Quản trị viên', teacher: 'Giảng viên', student: 'Học viên' };

/** Tương đương _legacy/pages/student/profile.html
 * - Form "Lưu thay đổi" KHÔNG gọi API cập nhật user thật — chỉ lưu vào localStorage (qua login() để đồng bộ context)
 * - Form đổi mật khẩu chỉ validate phía client, không gọi API, thông báo thành công giả lập
 */
export default function Profile() {
  const { user, login, token } = useAuth();

  const [fullname, setFullname] = useState(user?.fullname || '');
  const [infoAlert, setInfoAlert] = useState(null);
  const [coursesCount, setCoursesCount] = useState(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwAlert, setPwAlert] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await courseService.getCourses();
      setCoursesCount(res?.data?.data?.length ?? null);
    })();
  }, []);

  const initials = user?.fullname
    ? user.fullname
        .split(' ')
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : '?';

  function handleInfoSubmit(e) {
    e.preventDefault();
    const name = fullname.trim();
    if (!name) {
      setInfoAlert({ type: 'danger', text: 'Vui lòng nhập họ tên!' });
      return;
    }
    // Không có API cập nhật user thật — chỉ cập nhật localStorage/context (thay cho localStorage.setItem('user', ...) bản gốc)
    const updated = { ...user, fullname: name };
    login(token, updated);
    setInfoAlert({ type: 'success', text: '✅ Cập nhật thành công!' });
    setTimeout(() => setInfoAlert(null), 3000);
  }

  function handlePwSubmit(e) {
    e.preventDefault();
    if (newPw.length < 8) {
      setPwAlert({ type: 'danger', text: 'Mật khẩu phải có ít nhất 8 ký tự!' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwAlert({ type: 'danger', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    setPwAlert({ type: 'success', text: '✅ Đổi mật khẩu thành công!' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setPwAlert(null), 3000);
  }

  return (
    <main className="s-main">
      <div className="s-page-title">👤 Hồ sơ cá nhân</div>
      <div className="s-page-subtitle">Quản lý thông tin tài khoản của bạn</div>

      {/* Profile Hero */}
      <div className="s-profile-hero">
        <div className="s-profile-avatar-lg" id="profileAvatarLg">
          {initials}
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.25rem' }} id="profileName">
            {user?.fullname || '—'}
          </h2>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }} id="profileEmail">
            {user?.email || '—'}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }} id="profileCourses">
                {coursesCount ?? '—'}
              </div>
              <div style={{ fontSize: '.78rem', opacity: 0.7 }}>Khóa học</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>2</div>
              <div style={{ fontSize: '.78rem', opacity: 0.7 }}>Chứng chỉ</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>8.5</div>
              <div style={{ fontSize: '.78rem', opacity: 0.7 }}>Điểm TB</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }} id="profileJoined">
                {new Date().getFullYear()}
              </div>
              <div style={{ fontSize: '.78rem', opacity: 0.7 }}>Tham gia</div>
            </div>
          </div>
        </div>
      </div>

      <div className="s-grid-2">
        {/* Update Info */}
        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">✏️ Cập nhật thông tin</span>
          </div>
          <div className="s-card-body">
            <div id="infoAlert">{infoAlert && <div className={`s-alert s-alert-${infoAlert.type}`}>{infoAlert.text}</div>}</div>
            <form id="infoForm" onSubmit={handleInfoSubmit}>
              <div className="s-form-group">
                <label className="s-label">Họ và tên</label>
                <input
                  className="s-input"
                  type="text"
                  placeholder="Nhập họ tên..."
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="s-form-group">
                <label className="s-label">Email</label>
                <input className="s-input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} readOnly />
              </div>
              <div className="s-form-group">
                <label className="s-label">Vai trò</label>
                <input
                  className="s-input"
                  type="text"
                  value={ROLE_LABELS[user?.role] || user?.role || ''}
                  disabled
                  style={{ opacity: 0.6 }}
                  readOnly
                />
              </div>
              <button type="submit" className="s-btn s-btn-primary" style={{ width: '100%' }}>
                💾 Lưu thay đổi
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">🔒 Đổi mật khẩu</span>
          </div>
          <div className="s-card-body">
            <div id="pwAlert">{pwAlert && <div className={`s-alert s-alert-${pwAlert.type}`}>{pwAlert.text}</div>}</div>
            <form id="pwForm" onSubmit={handlePwSubmit}>
              <div className="s-form-group">
                <label className="s-label">Mật khẩu hiện tại</label>
                <input
                  className="s-input"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại..."
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>
              <div className="s-form-group">
                <label className="s-label">Mật khẩu mới</label>
                <input
                  className="s-input"
                  type="password"
                  placeholder="Ít nhất 8 ký tự..."
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              <div className="s-form-group">
                <label className="s-label">Xác nhận mật khẩu mới</label>
                <input
                  className="s-input"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
              <button type="submit" className="s-btn s-btn-outline" style={{ width: '100%' }}>
                🔑 Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Avatar upload card */}
      <div className="s-card" style={{ marginTop: '1.25rem' }}>
        <div className="s-card-header">
          <span className="s-card-title">🖼 Ảnh đại diện</span>
        </div>
        <div className="s-card-body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div
            id="avatarPreview"
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--s-primary),#8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '.875rem', color: 'var(--s-text-muted)', marginBottom: '1rem' }}>
              Chọn ảnh JPG, PNG hoặc GIF. Tối đa 2MB.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="s-btn s-btn-outline" onClick={() => window.alert('Tính năng đang phát triển!')}>
                📂 Chọn ảnh
              </button>
              <button className="s-btn s-btn-ghost" onClick={() => window.alert('Đã xóa ảnh!')}>
                🗑 Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
