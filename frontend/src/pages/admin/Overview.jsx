import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';

/** Tương đương renderUsersTable/#adminUsersTable row avatar: từ cuối cùng, 2 ký tự đầu. */
function rowInitials(fullname) {
  return fullname ? fullname.split(' ').pop().slice(0, 2).toUpperCase() : 'U';
}

function roleBadgeClass(role) {
  return role === 'admin' ? 'badge-danger' : role === 'teacher' ? 'badge-success' : 'badge-primary';
}

/** Tương đương #dashboardView trong _legacy/pages/admin/dashboard.html (view "dashboard"). */
export default function AdminOverview() {
  const [users, setUsers] = useState(null); // null = đang tải
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    (async () => {
      const [coursesRes, usersRes] = await Promise.all([courseService.getCourses(), userService.getUsers()]);
      setCourses(coursesRes?.ok && coursesRes.data?.success ? coursesRes.data.data || [] : []);
      setUsers(usersRes?.ok && usersRes.data?.success ? usersRes.data.data || [] : []);
    })();
  }, []);

  const allUsers = users || [];
  const allCourses = courses || [];
  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const students = allUsers.filter((u) => u.role === 'student');

  // Công thức % giữ nguyên fetchAndRefreshData() bản gốc: pA = phần còn lại (100 - pS - pT),
  // không tính riêng theo admins.length để làm tròn luôn khớp tổng 100%.
  const total = allUsers.length || 1;
  const pS = Math.round((students.length / total) * 100);
  const pT = Math.round((teachers.length / total) * 100);
  const pA = 100 - pS - pT;

  const conicBackground = `conic-gradient(var(--primary) 0% ${pS}%, var(--accent) ${pS}% ${pS + pT}%, var(--warning) ${pS + pT}% 100%)`;

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/admin">Admin</Link> / <span>Dashboard</span>
        </div>
        <h1 className="page-title">Dashboard Tổng quan</h1>
        <p className="page-subtitle">Thống kê hoạt động và quản lý hệ thống thời gian thực.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--primary)' }}>
            👥
          </div>
          <div>
            <div className="stat-label">Tổng User</div>
            <div className="stat-value">{allUsers.length}</div>
            <span className="stat-trend trend-up">↑ Hoạt động tốt</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
            👨‍🏫
          </div>
          <div>
            <div className="stat-label">Giảng viên</div>
            <div className="stat-value">{teachers.length}</div>
            <span className="stat-trend trend-up">↑ Giảng dạy</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--info)' }}>
            🎒
          </div>
          <div>
            <div className="stat-label">Học viên</div>
            <div className="stat-value">{students.length}</div>
            <span className="stat-trend trend-up">↑ Học trực tuyến</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent)' }}>
            📚
          </div>
          <div>
            <div className="stat-label">Khóa học</div>
            <div className="stat-value">{allCourses.length}</div>
            <span className="stat-trend trend-up">↑ Đang chạy</span>
          </div>
        </div>
      </div>

      <div className="col-3-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem' }}>📚 Khóa học mới nhất</h3>
              <Link to="/admin/courses" className="btn btn-ghost btn-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Tên khóa học</th>
                      <th>Giảng viên</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses === null && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    )}
                    {courses !== null && allCourses.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          Không có khóa học nào.
                        </td>
                      </tr>
                    )}
                    {allCourses.slice(0, 5).map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div
                            style={{
                              width: 40,
                              height: 28,
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              background: 'var(--primary-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {c.thumbnail ? (
                              <img src={c.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              '📘'
                            )}
                          </div>
                        </td>
                        <td>
                          <strong>{c.title}</strong>
                        </td>
                        <td>{c.teacher_name || 'Chưa phân công'}</td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem' }}>👥 Người dùng mới nhất</h3>
              <Link to="/admin/users" className="btn btn-ghost btn-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users === null && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    )}
                    {users !== null && allUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          Không có thành viên nào.
                        </td>
                      </tr>
                    )}
                    {allUsers.slice(0, 5).map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="avatar avatar-sm" style={{ background: 'var(--primary)', fontSize: '0.75rem' }}>
                            {rowInitials(u.fullname)}
                          </div>
                        </td>
                        <td>
                          <strong>{u.fullname}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${roleBadgeClass(u.role)}`}>{(u.role || '').toUpperCase()}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">Online</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>📊 Phân bổ vai trò</h3>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: conicBackground,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{allUsers.length}</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Thành viên
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, background: 'var(--primary)', borderRadius: '50%' }}></span>
                  Học viên (Students)
                </span>
                <strong>{users === null ? '—' : `${pS}%`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: '50%' }}></span>
                  Giảng viên (Teachers)
                </span>
                <strong>{users === null ? '—' : `${pT}%`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 10, height: 10, background: 'var(--warning)', borderRadius: '50%' }}></span>
                  Quản trị (Admins)
                </span>
                <strong>{users === null ? '—' : `${pA}%`}</strong>
              </div>
            </div>
          </div>

          {/* Danh sách hoạt động hệ thống: bản gốc là nội dung tĩnh (hard-coded), giữ nguyên verbatim. */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🔔 Hoạt động hệ thống</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: 4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                  }}
                ></span>
                <p style={{ margin: 0, color: 'var(--text)', fontWeight: 500 }}>
                  Kết nối máy chủ cơ sở dữ liệu thành công
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Vừa xong</span>
              </div>
              <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: -6,
                    top: 4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--success)',
                  }}
                ></span>
                <p style={{ margin: 0, color: 'var(--text)', fontWeight: 500 }}>
                  Hệ thống API RESTful đã sẵn sàng hoạt động
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>10 phút trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
