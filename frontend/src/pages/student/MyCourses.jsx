import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { progressService } from '../../services/progressService';
import { buildDashboardOverview } from '../../utils/dashboardOverview';
import CourseThumb from '../../components/common/CourseThumb';
import '../../assets/css/my-courses.css';

// Biểu tượng và màu nền trang trí thẻ khóa học
const EMOJIS = ['🎨', '💻', '📊', '🔬', '🌐', '📱', '🎵', '✏️', '🧪', '📐'];
const COLORS = ['#2563EB,#8B5CF6', '#0F766E,#06B6D4', '#7C3AED,#EC4899', '#DC2626,#F59E0B', '#059669,#2563EB', '#D97706,#EF4444'];

// Các tab lọc theo trạng thái học
const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'inprogress', label: 'Đang học' },
  { key: 'done', label: 'Hoàn thành' },
  { key: 'notstarted', label: 'Chưa bắt đầu' },
  { key: 'unknown', label: 'Chưa xác định' },
];

const requests = {
  catalog: () => courseService.getCourses(),
  enrollments: () => enrollmentService.getEnrolledIds(),
  progress: () => progressService.getProgress(),
};
function useCourseResource(key) {
  const [state, setState] = useState({data:null, loading:true, error:false});
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setState({data:null, loading:true, error:false});
    (async () => {
      try {
        const response = await requests[key]();
        const data = key === 'progress' ? response?.data?.data?.courses : response?.data?.data;
        if (!response?.ok || response.data?.success !== true || !Array.isArray(data)) throw new Error('Unavailable resource');
        if (key === 'enrollments' && data.some(id => !Number.isSafeInteger(Number(id)) || Number(id) <= 0)) throw new Error('Invalid enrollment ID');
        if (active) setState({data, loading:false, error:false});
      } catch {
        if (active) setState({data:null, loading:false, error:true});
      }
    })();
    return () => { active = false; };
  }, [key, version]);
  return {...state, retry:() => setVersion(value => value + 1)};
}

export default function MyCourses() {
  const catalog = useCourseResource('catalog');
  const enrollments = useCourseResource('enrollments');
  const progress = useCourseResource('progress');
  const overview = buildDashboardOverview(catalog.data, enrollments.data, progress.data);
  const allCourses = overview.enrolled || [];
  const loading = catalog.loading || enrollments.loading;
  const ready = !loading && !catalog.error && !enrollments.error;
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const clearFilters = () => { setCurrentFilter('all'); setSearchVal(''); };

  // Lọc theo tab trạng thái + ô tìm kiếm tên khóa
  const filtered = (allCourses || []).filter((c) => {
    const matchFilter = currentFilter === 'all' || c.status === currentFilter;
    const matchSearch = !searchVal || (c.title || '').toLowerCase().includes(searchVal.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <main className="s-main">
      <div className="s-page-title">📚 Khóa học của tôi</div>
      <div className="s-page-subtitle">Danh sách các khóa học bạn đang theo học</div>

      {[['catalog', catalog, 'danh sách khóa học'], ['enrollments', enrollments, 'trạng thái đăng ký'], ['progress', progress, 'tiến độ học tập']].map(([key, resource, label]) => resource.error && <div className="my-courses-notice" role="alert" key={key}>
        <div><strong>Chưa tải được {label}.</strong><p>{key === 'progress' ? 'Bạn vẫn có thể vào học. Tiến độ chưa xác định sẽ không được hiển thị thành 0%.' : 'Vui lòng thử lại để xem đúng các khóa đã đăng ký.'}</p></div>
        <button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={resource.retry}>Thử lại {label}</button>
      </div>)}
      {ready && enrollments.data.length > allCourses.length && <p className="my-courses-notice" role="status">Một số khóa đã đăng ký hiện không có trong danh mục truy cập được.</p>}
      {/* Filter Bar */}
      <div className="s-filter-bar">
        <input
          className="s-input"
          type="search"
          aria-label="Tìm khóa học đã đăng ký"
          placeholder="🔍 Tìm tên khóa học..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        <div className="s-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              aria-pressed={currentFilter === f.key}
              disabled={!ready || (progress.loading && f.key !== 'all')}
              className={`s-filter-tab${currentFilter === f.key ? ' active' : ''}`}
              onClick={() => setCurrentFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="s-course-grid" id="courseGrid">
        {loading && (
          <div style={{ color: 'var(--s-text-muted)', padding: '2rem' }}>Đang tải khóa học...</div>
        )}

        {ready && filtered.length === 0 && (
          <div className="s-empty" style={{ gridColumn: '1/-1' }}>
            <div className="icon">📭</div>
            <h3>{enrollments.data.length === 0 ? 'Bạn chưa đăng ký khóa học nào' : 'Không có khóa học phù hợp bộ lọc'}</h3>
            {enrollments.data.length === 0 ? <Link to="/student/courses" className="s-btn s-btn-primary s-btn-sm">Khám phá khóa học</Link> : <><p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p><button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={clearFilters}>Xóa bộ lọc</button></>}
          </div>
        )}

        {ready &&
          filtered.map((c) => {
            const idx = (allCourses || []).indexOf(c);
            const { status } = c;
            const pct = c.progress?.percent;
            const totalLessons = c.progress?.total;
            const doneLessons = c.progress?.done;

            const statusBadge =
              status === 'done' ? (
                <span className="s-badge s-badge-green">✅ Hoàn thành</span>
              ) : status === 'notstarted' ? (
                <span className="s-badge s-badge-gray">⏸ Chưa bắt đầu</span>
              ) : status === 'unknown' || status === 'empty' ? (
                <span className="s-badge s-badge-gray">{status === 'empty' ? 'Chưa có bài học' : progress.loading ? 'Đang tải tiến độ…' : 'Chưa xác định tiến độ'}</span>
              ) : (
                <span className="s-badge s-badge-warn">▶ Đang học</span>
              );

            return (
              <div key={c.id} className="s-course-card">
                <div className="s-course-thumb" style={{ background: `linear-gradient(135deg,${COLORS[idx % COLORS.length]})` }}>
                  <CourseThumb src={c.thumbnail} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} fallback={<span style={{ fontSize: '2.5rem' }}>{EMOJIS[idx % EMOJIS.length]}</span>} />
                </div>
                <div className="s-course-body">
                  <h3>{c.title || 'Khóa học'}</h3>
                  <p className="teacher">👨‍🏫 {c.teacher_name || 'Giảng viên StudyOnline'}</p>
                  <div className="s-course-meta">
                    <span>{c.progress && totalLessons > 0 ? `📖 ${doneLessons}/${totalLessons} bài hoàn thành` : status === 'empty' ? 'Khóa học chưa có bài học' : 'Chưa có dữ liệu tiến độ'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.78rem', color: 'var(--s-text-muted)' }}>{pct != null && totalLessons > 0 ? `${pct}% hoàn thành` : '—'}</span>
                    {statusBadge}
                  </div>
                  <div className="s-progress" hidden={!c.progress || !totalLessons} role="progressbar" aria-label={`Tiến độ ${c.title}`} aria-valuenow={pct ?? undefined} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className={`s-progress-bar${status === 'done' ? ' green' : ''}`}
                      style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                    />
                  </div>
                </div>
                <div className="s-course-footer">
                  <span style={{ fontSize: '.8rem', color: 'var(--s-text-muted)' }}>📚 Khóa đã đăng ký</span>
                  <Link to={`/chapters?course_id=${c.id}`} className="s-btn s-btn-primary s-btn-sm">
                    {status === 'notstarted' ? '🚀 Bắt đầu' : status === 'done' ? '🔄 Xem lại' : status === 'inprogress' ? '▶ Tiếp tục' : 'Vào khóa học'}
                  </Link>
                </div>
              </div>
            );
          })}
      </div>
    </main>
  );
}
