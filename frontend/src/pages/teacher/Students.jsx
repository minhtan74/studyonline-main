import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';

function initialsOf(name) {
  return name ? name.split(' ').pop().slice(0, 2).toUpperCase() : 'U';
}

/**
 * Tương đương #studentsView (view 6) của teacher/dashboard.html — bảng học
 * viên SUY RA từ mảng enrollments (không có API riêng).
 *
 * LƯU Ý (giữ nguyên hành vi gốc, đã đọc kỹ renderStudents()/filterStudentsList()
 * trong dashboard.html): danh sách gốc "Tất cả khóa học" hiển thị TOÀN BỘ
 * enrollments của hệ thống, KHÔNG lọc theo khóa học của riêng giảng viên —
 * chỉ dropdown lọc theo khóa học mới giới hạn ở các khóa của giảng viên. Đây
 * có vẻ là một khoảng hở/bug trong bản gốc, nhưng được giữ nguyên 1:1 theo
 * yêu cầu "preserve exact formulas" thay vì tự ý sửa.
 */
export default function TeacherStudents() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const [coursesRes, enrollRes] = await Promise.all([courseService.getCourses(), enrollmentService.getEnrollments()]);
      const allCourses = coursesRes?.ok ? coursesRes.data.data || [] : [];
      if (cancelled) return;
      setTeacherCourses(allCourses.filter((c) => c.teacher_id === user?.id || user?.role === 'admin'));
      setEnrollments(enrollRes?.ok ? enrollRes.data.data || [] : []);
      setLoading(false);
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    let list = enrollments;
    if (courseFilter !== 'all') {
      list = list.filter((e) => e.course_id === Number(courseFilter));
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter((e) => (e.user_name || '').toLowerCase().includes(q) || (e.user_email || '').toLowerCase().includes(q));
    }
    return list;
  }, [enrollments, courseFilter, search]);

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <span>Instructor</span> / <span>Students</span>
        </div>
        <h1 className="page-title">👨‍🎓 Danh sách Học viên</h1>
        <p className="page-subtitle">Theo dõi tiến trình học và kết quả kiểm tra của học sinh.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm học viên..."
              style={{ maxWidth: 300 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="form-control" style={{ maxWidth: 220 }} value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="all">Tất cả khóa học</option>
              {teacherCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Khóa học đăng ký</th>
                  <th>Tiến độ học tập</th>
                  <th>Điểm Quiz trung bình</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      <span
                        className="spinner"
                        style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'var(--primary)' }}
                      ></span>{' '}
                      Đang tải danh sách học viên...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy học viên nào.
                    </td>
                  </tr>
                )}
                {!loading &&
                  filtered.map((e, idx) => {
                    const total = Number(e.total_lessons || 0);
                    const completed = Number(e.completed_lessons || 0);
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const quizScore = e.avg_quiz_score !== null && e.avg_quiz_score !== undefined ? `${e.avg_quiz_score}%` : 'Chưa thi';
                    const scoreBadge =
                      e.avg_quiz_score !== null && e.avg_quiz_score !== undefined
                        ? e.avg_quiz_score >= 80
                          ? 'success'
                          : 'warning'
                        : 'danger';
                    return (
                      <tr key={e.id ?? idx}>
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
                            <div className="course-progress-bar" style={{ margin: 0, width: 100 }}>
                              <div className="course-progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <strong style={{ fontSize: '0.75rem' }}>{progress}%</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${scoreBadge}`}>{quizScore}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">Online</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
