import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { progressService } from '../../services/progressService';
import WeeklyBarChart from '../../components/common/WeeklyBarChart';
import StudyRecommendationSummary from '../../components/common/StudyRecommendationSummary';
import { buildDashboardOverview } from '../../utils/dashboardOverview';
import { formatStudyDate } from '../../utils/studyDate';
import '../../assets/css/student-courses.css';
import '../../assets/css/student-dashboard.css';

const INITIAL = { catalog: null, enrolledIds: null, progress: null, weekly: null, recent: null,
  pending: { catalog:true, enrolledIds:true, progress:true, weekly:true, recent:true } };

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState(INITIAL);
  const [version, setVersion] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  useEffect(() => {
    let active = true;
    setState(INITIAL);
    (async () => {
      const requests = [
        ['catalog', () => courseService.getCourses()], ['enrolledIds', () => enrollmentService.getEnrolledIds()],
        ['progress', () => progressService.getProgress()], ['weekly', () => progressService.getWeeklyProgress()],
        ['recent', () => progressService.getRecentActivities()],
      ];
      await Promise.allSettled(requests.map(async ([key,request]) => {
        let value = null;
        try {
          const response = await request();
          if (response?.ok && response.data?.success !== false) {
            const payload = key === 'progress' ? response.data?.data?.courses : response.data?.data;
            if (Array.isArray(payload)) value = payload;
          }
        } catch { /* Each panel reports its own unavailable data. */ }
        if (active) setState(previous => ({...previous,[key]:value,pending:{...previous.pending,[key]:false}}));
      }));
    })();
    return () => { active = false; };
  }, [version]);

  const overview = useMemo(() => buildDashboardOverview(state.catalog, state.enrolledIds, state.progress), [state.catalog,state.enrolledIds,state.progress]);
  const { metrics } = overview;
  const focusCourse = overview.continueCourses.find(course => String(course.id) === selectedCourseId) || overview.continueCourses[0];
  const coreLoading = state.pending.catalog || state.pending.enrolledIds;
  const selectedCourses = useMemo(() => overview.enrolled?.map(c => ({course_id:c.id,course_title:c.title})) || [], [overview.enrolled]);
  const weeklyTotal = state.weekly?.reduce((sum,row) => sum + (Number(row.count) || 0),0);
  const retry = <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={() => setVersion(value => value + 1)}>Thử lại</button>;
  const stats = [
    { icon:'📚', label:'Khóa đã đăng ký', value:metrics.enrolled, tone:'blue' },
    { icon:'▶', label:'Khóa đang học', value:metrics.inProgress, tone:'violet' },
    { icon:'✓', label:'Khóa hoàn thành', value:metrics.completed, tone:'green' },
    { icon:'📖', label:'Bài đã hoàn thành', value:metrics.doneLessons == null ? null : `${metrics.doneLessons}/${metrics.totalLessons}`, tone:'amber' },
  ];

  return <main className="s-main student-dashboard">
    <header className="dash-heading">
      <div><p className="dash-eyebrow">Góc học tập của bạn</p><h1>Xin chào, {user?.fullname || 'bạn'}! 👋</h1>
        <p>Chọn một khóa học để tiếp tục, hoặc củng cố nội dung bạn chưa nắm vững.</p></div>
      <Link to="/student/my-courses" className="s-btn s-btn-outline s-btn-sm">Khóa học của tôi →</Link>
    </header>

    <div className="dash-start-grid">
      <section className="dash-focus s-card dash-continue" aria-label="Tiếp tục học">
        <div className="dash-focus-heading"><div><span className="dash-step-label">Bước tiếp theo của bạn</span><h2>Tiếp tục học</h2></div><span className="dash-focus-symbol" aria-hidden="true">📘</span></div>
        {coreLoading ? <p className="dash-muted" role="status">Đang tải khóa học…</p>
          : overview.enrolled === null ? <div role="alert"><p>Chưa tải được danh sách khóa học.</p>{retry}</div>
            : !overview.enrolled.length ? <div className="dash-empty"><h3>Bắt đầu lộ trình đầu tiên</h3><p>Khám phá nội dung và chọn khóa học phù hợp với bạn.</p><Link to="/student/courses" className="s-btn s-btn-primary">Khám phá khóa học →</Link></div>
              : !focusCourse ? <div className="dash-empty"><h3>{overview.enrolled.every(course => course.status === 'done') ? 'Bạn đã hoàn thành các khóa đã đăng ký' : 'Chưa có khóa học có thể tiếp tục'}</h3><p>Xem lại bài đã học hoặc chọn nội dung cần ôn bên dưới.</p><Link to="/student/my-courses" className="s-btn s-btn-primary">Xem lại khóa học →</Link></div>
                : <>
                  {overview.continueCourses.length > 1 && <div className="dash-course-picker"><label htmlFor="dashboard-course">Chọn khóa để học</label><select id="dashboard-course" value={String(focusCourse.id)} onChange={event => setSelectedCourseId(event.target.value)}>{overview.continueCourses.map(course => <option value={course.id} key={course.id}>{course.title}</option>)}</select></div>}
                  <article className="dash-focus-course" key={focusCourse.id}>
                    <span className="dash-course-status">{focusCourse.status === 'inprogress' ? 'Đang học' : focusCourse.status === 'notstarted' ? 'Sẵn sàng bắt đầu' : 'Khóa học đã đăng ký'}</span>
                    <h3>{focusCourse.title || 'Khóa học'}</h3>
                    {focusCourse.progress ? <><div className="dash-course-progress-copy"><span>{focusCourse.progress.done}/{focusCourse.progress.total} bài hoàn thành</span><strong>{focusCourse.progress.percent}%</strong></div>
                      <div className="s-progress" role="progressbar" aria-label={`Tiến độ ${focusCourse.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={focusCourse.progress.percent}><div className="s-progress-bar" style={{width:`${focusCourse.progress.percent}%`}} /></div>
                      <p className="dash-focus-hint">Còn {focusCourse.progress.total - focusCourse.progress.done} bài chưa hoàn thành trong khóa.</p></> : <p className="dash-muted">Chưa xác định tiến độ. Bạn vẫn có thể mở khóa để học.</p>}
                    <div className="dash-focus-actions"><Link to={`/chapters?course_id=${focusCourse.id}`} className="s-btn s-btn-primary" aria-label={`Vào học: ${focusCourse.title}`}>{focusCourse.status === 'notstarted' ? 'Bắt đầu học' : 'Vào học ngay'} <span aria-hidden="true">→</span></Link><span>Chọn chương và bài bạn muốn tiếp tục.</span></div>
                  </article>
                </>}
      </section>

      <section className="s-card dash-overview" aria-label="Tổng quan học tập">
        <div className="dash-overview-heading"><h2>Hành trình của bạn</h2><Link to="/student/progress">Xem chi tiết →</Link></div>
        <div className="dash-metrics">{stats.map(stat => <div className={`dash-metric dash-metric-${stat.tone}`} key={stat.label}>
          <span className="dash-metric-icon" aria-hidden="true">{stat.icon}</span><div><strong>{coreLoading || stat.value == null ? '—' : stat.value}</strong><span>{stat.label}</span></div>
        </div>)}</div>
        <p className="dash-overview-note">Tiến độ tính theo các bài đã hoàn thành trong khóa bạn đăng ký.</p>
      </section>
    </div>
    {!state.pending.progress && state.progress === null && <div className="dash-data-notice" role="alert">Chưa tải được tiến độ. Các chỉ số chưa xác định được hiển thị bằng dấu —. {retry}</div>}

    <nav className="dash-tools" aria-label="Truy cập nhanh">
      <Link to="/quiz"><span className="dash-tool-icon" aria-hidden="true">📝</span><span><strong>Luyện tập với Quiz</strong><small>Kiểm tra kiến thức đã học</small></span><span aria-hidden="true">→</span></Link>
      <Link to="/student/ai-tutor"><span className="dash-tool-icon" aria-hidden="true">💬</span><span><strong>Hỏi AI Tutor</strong><small>Giải đáp theo tài liệu khóa học</small></span><span aria-hidden="true">→</span></Link>
      <Link to="/student/progress"><span className="dash-tool-icon" aria-hidden="true">📈</span><span><strong>Xem tiến độ</strong><small>Theo dõi kết quả và nội dung cần ôn</small></span><span aria-hidden="true">→</span></Link>
    </nav>

    <div className="dash-workspace">
      <div className="dash-primary"><StudyRecommendationSummary courses={selectedCourses} pageSize={3} /></div>
      <aside className="dash-secondary" aria-label="Nhịp học và hoạt động">
        <section className="s-card" aria-label="Hoạt động học trong 7 ngày">
          <div className="s-card-header"><div><h2 className="s-card-title">Nhịp học 7 ngày</h2><p className="dash-section-caption">Nhìn lại các bài bạn đã hoàn thành.</p></div><span aria-hidden="true">📊</span></div>
          <div className="s-card-body">{state.pending.weekly ? <p className="dash-muted" role="status">Đang tải hoạt động…</p>
            : state.weekly === null ? <div role="alert"><p>Chưa tải được biểu đồ.</p>{retry}</div>
              : <><p className="dash-weekly-total"><strong>{weeklyTotal}</strong><span>bài hoàn thành trong 7 ngày gần nhất</span></p>
                {state.weekly.length > 0 && <div className="dash-weekly-chart"><WeeklyBarChart animated={false} data={state.weekly.map(row => Number(row.count) || 0)} labels={state.weekly.map(row => row.label || row.date?.slice(5) || '')} /></div>}
                {!weeklyTotal && <p className="dash-muted">Chưa có bài hoàn thành trong khoảng thời gian này.</p>}</>}
            <details className="dash-recent" aria-label="Hoạt động gần đây"><summary>Hoạt động gần đây</summary>
              {state.pending.recent ? <p className="dash-muted" role="status">Đang tải hoạt động…</p>
                : state.recent === null ? <div role="alert"><p>Chưa tải được hoạt động gần đây.</p>{retry}</div>
                  : !state.recent.length ? <p className="dash-muted">Các bài đã hoàn thành sẽ xuất hiện tại đây.</p>
                    : <ul className="dash-activity-list">{state.recent.slice(0,3).map((activity,index) => <li key={`${activity.lesson_id}-${index}`}><span className="dash-activity-dot" aria-hidden="true">✓</span>
                      <div>{Number(activity.lesson_id) > 0 ? <Link to={`/lesson?id=${activity.lesson_id}`}>{activity.lesson_title || 'Bài học'}</Link> : <strong>{activity.lesson_title || 'Bài học'}</strong>}<p>{activity.course_title}</p><time>{formatStudyDate(activity.completed_at)}</time></div></li>)}</ul>}
            </details>
          </div>
        </section>
      </aside>
    </div>

    <section className="dash-discover" aria-label="Khám phá thêm khóa học">
      <div className="dash-discover-heading"><div><h2 className="s-card-title">Khám phá thêm khóa học</h2><p className="dash-section-caption">Mở rộng lộ trình khi bạn sẵn sàng.</p></div><Link to="/student/courses" className="s-btn s-btn-ghost s-btn-sm">Xem danh mục →</Link></div>
      <div>{coreLoading ? <p className="dash-muted" role="status">Đang tải danh mục…</p>
        : overview.suggested === null ? <div role="alert"><p>Chưa tải được danh mục khóa học.</p>{retry}</div>
          : !overview.suggested.length ? <p className="dash-muted">Hiện chưa có khóa học mới để khám phá.</p>
            : <div className="s-course-grid dash-discover-grid">{overview.suggested.slice(0,3).map(course => {
              const index = Math.max(0, state.catalog.findIndex(item => Number(item.id) === Number(course.id)));
              const colors = ['#2563EB,#8B5CF6','#0F766E,#06B6D4','#7C3AED,#EC4899','#DC2626,#F59E0B','#059669,#2563EB','#D97706,#EF4444','#1D4ED8,#06B6D4','#7C3AED,#2563EB'];
              const icons = ['🎨','💻','📊','🔬','🌐','📱','🎵','✏️','🧪','📐','🚀','🔐'];
              const level = {beginner:['Cơ bản','level-begin'],intermediate:['Trung cấp','level-mid'],advanced:['Nâng cao','level-adv']}[course.level];
              const price = course.price == null ? null : Number(course.price);
              return <article className="s-course-card dash-discover-course" key={course.id}>
                <div className="s-course-thumb" style={{background:`linear-gradient(135deg,${colors[index % colors.length]})`}} aria-hidden="true"><span>{icons[index % icons.length]}</span></div>
                <div className="s-course-body">
                  <h3><Link to={`/chapters?course_id=${course.id}`}>{course.title}</Link></h3>
                  <p className="teacher">👨‍🏫 {course.teacher_name || 'Giảng viên StudyOnline'}</p>
                  <div className="s-course-meta">
                    {course.lesson_count != null && <span>📖 {Number(course.lesson_count) || 0} bài</span>}
                    {course.document_count != null && <span>📄 {Number(course.document_count) || 0} tài liệu</span>}
                  </div>
                  <div className="dash-discover-details">
                    {level && <span className={`level-badge ${level[1]}`}>{level[0]}</span>}
                    <span className={price === 0 ? 'price-free' : 'price-paid'}>{price != null && Number.isFinite(price) ? price > 0 ? `${price.toLocaleString('vi-VN')}đ` : '🆓 Miễn phí' : 'Xem thông tin khóa'}</span>
                  </div>
                </div>
                <div className="s-course-footer"><Link to={`/chapters?course_id=${course.id}`} className="s-btn s-btn-outline s-btn-sm" aria-label={`Xem đề cương: ${course.title}`}>Xem đề cương →</Link></div>
              </article>;
            })}</div>}
      </div>
    </section>
  </main>;
}
