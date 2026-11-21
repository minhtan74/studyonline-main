import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { paymentService } from '../../services/paymentService';
import { monthlyBars } from '../../utils/monthlyBars';
import { quizService } from '../../services/quizService';
import { buildTeacherDashboard, teacherEnrollmentProgress } from '../../utils/teacherDashboard';
import '../../assets/css/teacher-dashboard.css';

// Chữ viết tắt làm avatar: 2 ký tự đầu của từ cuối trong tên
function initialsOf(name) {
  return name ? name.split(' ').pop().slice(0, 2).toUpperCase() : 'U';
}

// Định dạng ngày dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function useDashboardResource(loader, identity) {
  const [state, setState] = useState({ status: 'loading', data: [] });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: [] });
    Promise.resolve().then(loader).then(response => {
      if (!response?.ok || response.data?.success !== true || !Array.isArray(response.data?.data)) throw new Error('Invalid dashboard response');
      if (active) setState({ status: 'ready', data: response.data.data });
    }).catch(() => { if (active) setState({ status: 'error', data: [] }); });
    return () => { active = false; };
  }, [loader, identity, version]);
  return { ...state, retry: () => setVersion(value => value + 1) };
}

function ResourceNotice({ resource, label }) {
  return <div className="teacher-resource-notice" role={resource.status === 'error' ? 'alert' : 'status'}>
    {resource.status === 'error' ? <>Chưa tải được {label}. <button type="button" className="btn btn-ghost btn-sm" onClick={resource.retry}>Thử lại</button></> : `Đang tải ${label}…`}
  </div>;
}

/** Dashboard thống nhất: tổng quan, doanh thu và tiến độ học viên. */
export default function TeacherOverview() {
  const { user } = useAuth();
  const identity = `${user?.id}:${user?.role}`;
  const courses = useDashboardResource(courseService.getCourses, identity);
  const enrollments = useDashboardResource(enrollmentService.getEnrollments, identity);
  const payments = useDashboardResource(paymentService.getPayments, identity);
  const quizzes = useDashboardResource(quizService.getQuizzes, identity);
  const loading = courses.status === 'loading';
  const error = courses.status === 'error';
  const data = useMemo(() => ({ courses: courses.data, enrollments: enrollments.data, payments: payments.data, quizzes: quizzes.data }), [courses.data,enrollments.data,payments.data,quizzes.data]);
  const [params, setParams] = useSearchParams();
  const rawCourse = params.get('course_id');
  const courseFilter = /^[1-9]\d*$/.test(rawCourse || '') ? rawCourse : 'all';
  const [search, setSearch] = useState('');
  const changeCourse = value => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value === 'all') next.delete('course_id'); else next.set('course_id',value);
    return next;
  }, {replace:true});

  const dashboard = useMemo(() => buildTeacherDashboard(data,user,courseFilter), [data,user,courseFilter]);
  const {ownCourses:teacherCourses, enrollments:scopedEnrollments, paidPayments, summary, topCourses} = dashboard;
  const enrollmentBars = useMemo(() => monthlyBars(scopedEnrollments, row => row.enroll_date, () => 1, value => `${value} lượt đăng ký`), [scopedEnrollments]);

  // Biểu đồ cột doanh thu 6 tháng gần nhất
  const revenueBars = useMemo(
    () => monthlyBars(paidPayments, (p) => p.paid_at, (p) => p.amount, (v) => Number(v).toLocaleString('vi-VN') + 'đ'),
    [paidPayments],
  );

  // Bảng học viên: theo khóa đang chọn + ô tìm kiếm (tên hoặc email)
  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return scopedEnrollments;
    return scopedEnrollments.filter((e) => (e.user_name || '').toLowerCase().includes(q) || (e.user_email || '').toLowerCase().includes(q));
  }, [scopedEnrollments, search]);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => { setPage(1); }, [search, courseFilter, enrollments.data]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const cards = [
    {icon:'📚',value:summary.courses,label:'Khóa học'},
    {icon:'👥',value:summary.students,label:'Học viên duy nhất',resource:enrollments},
    {icon:'📖',value:summary.lessons ?? '—',label:'Bài học đã xuất bản'},
    {icon:'📝',value:summary.quizzes,label:'Quiz và bộ ôn tập',resource:quizzes},
    {icon:'📈',value:summary.avgProgress == null ? '—' : `${summary.avgProgress}%`,label:'Tiến độ trung bình',resource:enrollments},
    {icon:'💵',value:`${summary.revenue.toLocaleString('vi-VN')}đ`,label:'Doanh thu giao dịch thành công',resource:payments},
  ];

  return (
    <div className="teacher-dashboard">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Dashboard Giảng viên</h1>
          <p className="page-subtitle">Tổng quan giảng dạy, học viên, kết quả học tập và doanh thu trong cùng một trang.</p>
        </div>
        <select className="form-control" style={{ maxWidth: 260 }} aria-label="Lọc Dashboard theo khóa học" disabled={loading || error} value={courseFilter} onChange={(e) => changeCourse(e.target.value)}>
          <option value="all">Tất cả khóa học</option>
          {dashboard.missingCourse && <option value={courseFilter}>Khóa không còn trong danh sách</option>}
          {teacherCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner" />
        </div>
      ) : error ? <div className="card teacher-dashboard-error" role="alert"><h2>Chưa tải được Dashboard.</h2><p>Vui lòng thử lại. Số liệu chưa tải được sẽ không hiển thị thành 0.</p><button type="button" className="btn btn-primary btn-sm" onClick={courses.retry}>Thử lại</button></div> : dashboard.missingCourse ? <div className="card teacher-dashboard-error" role="alert"><p>Khóa học đã chọn không còn trong danh sách bạn được quản lý.</p><button type="button" className="btn btn-primary btn-sm" onClick={() => changeCourse('all')}>Xem tất cả khóa học</button></div> : (
        <>
          <p className="teacher-dashboard-scope">{courseFilter === 'all' ? 'Tổng hợp các khóa học bạn được quản lý' : 'Đang xem dữ liệu của khóa học đã chọn'}{enrollments.status === 'ready' && <> · {summary.students} học viên duy nhất · {summary.enrollments} lượt đăng ký · {summary.completedLessons ?? '—'} lượt hoàn thành bài học</>}</p>
          {/* Ô tổng hợp */}
          <div className="teacher-dashboard-metrics">
            {cards.map((c) => (
              <div className="stat-card" key={c.label}>
                <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {c.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{c.resource && c.resource.status !== 'ready' ? '—' : c.value}</div>
                  <div className="stat-label">{c.label}</div>{c.resource && c.resource.status !== 'ready' && <ResourceNotice resource={c.resource} label={c.label.toLowerCase()} />}
                </div>
              </div>
            ))}
          </div>

          <div className="teacher-dashboard-charts">
            <section className="card teacher-dashboard-chart" aria-label="Lượt đăng ký theo tháng"><h2>📈 Lượt đăng ký theo tháng</h2><p>6 tháng gần nhất, theo phạm vi khóa học đã chọn.</p>{enrollments.status !== 'ready' ? <ResourceNotice resource={enrollments} label="lượt đăng ký" /> : <div className="bar-chart">{enrollmentBars.map(bar => <div className="bar-item" key={bar.label}><div className="bar-value" style={{height:`${bar.height}%`}} data-tooltip={bar.tooltip} /><span className="teacher-bar-number">{bar.tooltip}</span><span className="bar-label">{bar.label}</span></div>)}</div>}</section>
            <section className="card teacher-dashboard-chart" aria-label="Doanh thu theo tháng"><h2>💵 Doanh thu theo tháng</h2><p>Các giao dịch thành công trong 6 tháng gần nhất.</p>{payments.status !== 'ready' ? <ResourceNotice resource={payments} label="doanh thu" /> : <div className="bar-chart">{revenueBars.map(bar => <div className="bar-item" key={bar.label}><div className="bar-value" style={{height:`${bar.height}%`,background:'var(--success)'}} data-tooltip={bar.tooltip} /><span className="teacher-bar-number">{bar.tooltip}</span><span className="bar-label">{bar.label}</span></div>)}</div>}</section>
          </div>
          <section className="card teacher-dashboard-courses"><div className="card-header"><h2>Khóa học và lượt đăng ký</h2><Link to="/teacher/courses" className="btn btn-ghost btn-sm">Quản lý khóa học →</Link></div><div className="card-body teacher-dashboard-course-list">
            {enrollments.status !== 'ready' && <ResourceNotice resource={enrollments} label="lượt đăng ký khóa học" />}{!topCourses.length && <p>Chưa có khóa học trong phạm vi đã chọn.</p>}
            {topCourses.map(({course,count}) => <article key={course.id}><h3>{course.title}</h3><p>{enrollments.status === 'ready' ? `${count} lượt đăng ký` : 'Chưa có số liệu đăng ký'} · {course.lesson_count ?? '—'} bài đã xuất bản</p><Link to={`/teacher/chapters?course_id=${course.id}`}>Quản lý chương và bài →</Link></article>)}
          </div></section>
          {/* Bảng học viên */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>👨‍🎓 Lượt đăng ký {enrollments.status === 'ready' ? `(${rows.length})` : ''}</h3>
              <input
                aria-label="Tìm học viên theo tên hoặc email"
                type="search"
                className="form-control"
                placeholder="Tìm theo tên hoặc email..."
                style={{ maxWidth: 300 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {enrollments.status !== 'ready' ? <ResourceNotice resource={enrollments} label="danh sách học viên" /> : <><p className="teacher-table-note">Mỗi dòng là một học viên trong một khóa học. Một người có thể đăng ký nhiều khóa.</p><div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Họ và tên</th>
                      <th>Email</th>
                      <th>Khóa học đăng ký</th>
                      <th>Tiến độ học tập</th>
                      <th>Điểm Quiz trung bình</th>
                      <th>Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          Không tìm thấy học viên nào.
                        </td>
                      </tr>
                    )}
                    {visibleRows.map((e) => {
                      const progress = teacherEnrollmentProgress(e);
                      const hasScore = e.avg_quiz_score !== null && e.avg_quiz_score !== undefined && e.avg_quiz_score !== '' && Number.isFinite(Number(e.avg_quiz_score));
                      const score = Number(e.avg_quiz_score);
                      const scoreBadge = hasScore ? (score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger') : 'secondary';
                      return (
                        <tr key={`${e.user_id}-${e.course_id}`}>
                          <td>
                            <div className="avatar" style={{ background: 'var(--primary)', fontSize: '0.8rem' }}>
                              {initialsOf(e.user_name)}
                            </div>
                          </td>
                          <td>
                            <strong>{e.user_name}</strong>
                          </td>
                          <td>{e.user_email}</td>
                          <td>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{e.course_title}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="course-progress-bar" hidden={progress == null} style={{ margin: 0, width: 100 }}>
                                <div className="course-progress-fill" style={{ width: `${progress}%` }}></div>
                              </div>
                              <div style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>
                                <strong>{progress == null ? 'Chưa xác định' : `${progress}%`}</strong>
                                <br />
                                <span style={{ color: 'var(--text-muted)' }}>
                                  {e.completed_lessons ?? '—'}/{e.total_lessons ?? '—'} bài đã xuất bản
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${scoreBadge}`}>{hasScore ? `${score.toFixed(0)}%` : 'Chưa thi'}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📅 {formatDate(e.enroll_date)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div><nav className="teacher-table-pagination" aria-label="Phân trang học viên"><span>{rows.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, rows.length)}` : '0'}/{rows.length} lượt đăng ký · Trang {currentPage}/{pageCount}</span><div><button type="button" className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Trang trước</button><button type="button" className="btn btn-ghost btn-sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Trang sau</button></div></nav></>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
