import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';

const STATUSES = ['inprogress', 'done', 'notstarted'];
const EMOJIS = ['🎨', '💻', '📊', '🔬', '🌐', '📱', '🎵', '✏️', '🧪', '📐'];
const COLORS = ['#2563EB,#8B5CF6', '#0F766E,#06B6D4', '#7C3AED,#EC4899', '#DC2626,#F59E0B', '#059669,#2563EB', '#D97706,#EF4444'];

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'inprogress', label: 'Đang học' },
  { key: 'done', label: 'Hoàn thành' },
  { key: 'notstarted', label: 'Chưa bắt đầu' },
];

function getCourseStatus(idx) {
  return STATUSES[idx % 3];
}

function getCourseProgress(status) {
  if (status === 'done') return 100;
  if (status === 'notstarted') return 0;
  return Math.floor(Math.random() * 60) + 20;
}

/** Tương đương _legacy/pages/student/my-courses.html — status/progress hoàn toàn mock/deterministic theo idx */
export default function MyCourses() {
  const [allCourses, setAllCourses] = useState(null); // null = đang tải
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    (async () => {
      const res = await courseService.getCourses();
      setAllCourses(res?.data?.data || []);
    })();
  }, []);

  // Không memo hoá: bản gốc gọi getCourseProgress() (Math.random) mỗi lần renderCourses(),
  // nên % tiến độ "inprogress" đổi mỗi lần re-render — giữ nguyên hành vi mock đó ở đây.
  const filtered = (allCourses || []).filter((c, i) => {
    const status = getCourseStatus(i);
    const matchFilter = currentFilter === 'all' || status === currentFilter;
    const matchSearch = !searchVal || (c.title || '').toLowerCase().includes(searchVal.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <main className="s-main">
      <div className="s-page-title">📚 Khóa học của tôi</div>
      <div className="s-page-subtitle">Danh sách các khóa học bạn đang theo học</div>

      {/* Filter Bar */}
      <div className="s-filter-bar">
        <input
          className="s-input"
          type="text"
          placeholder="🔍 Tìm tên khóa học..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        <div className="s-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
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
        {allCourses === null && <div style={{ color: 'var(--s-text-muted)', padding: '2rem' }}>Đang tải khóa học...</div>}

        {allCourses !== null && filtered.length === 0 && (
          <div className="s-empty" style={{ gridColumn: '1/-1' }}>
            <div className="icon">📭</div>
            <h3>Không có khóa học nào</h3>
            <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
          </div>
        )}

        {allCourses !== null &&
          filtered.map((c) => {
            const idx = allCourses.indexOf(c);
            const status = getCourseStatus(idx);
            const pct = getCourseProgress(status);
            const lessons = Math.floor(Math.random() * 20) + 5;
            const hours = (lessons * 0.5).toFixed(0);
            const statusBadge =
              status === 'done' ? (
                <span className="s-badge s-badge-green">✅ Hoàn thành</span>
              ) : status === 'notstarted' ? (
                <span className="s-badge s-badge-gray">⏸ Chưa bắt đầu</span>
              ) : (
                <span className="s-badge s-badge-warn">▶ Đang học</span>
              );

            return (
              <div key={c.id} className="s-course-card">
                <div className="s-course-thumb" style={{ background: `linear-gradient(135deg,${COLORS[idx % COLORS.length]})` }}>
                  <span style={{ fontSize: '2.5rem' }}>{EMOJIS[idx % EMOJIS.length]}</span>
                </div>
                <div className="s-course-body">
                  <h3>{c.title || 'Khóa học'}</h3>
                  <p className="teacher">👨‍🏫 Giảng viên StudyOnline</p>
                  <div className="s-course-meta">
                    <span>📖 {lessons} bài</span>
                    <span>⏱ {hours}h</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.78rem', color: 'var(--s-text-muted)' }}>{pct}% hoàn thành</span>
                    {statusBadge}
                  </div>
                  <div className="s-progress">
                    <div className={`s-progress-bar${status === 'done' ? ' green' : ''}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div className="s-course-footer">
                  <span style={{ fontSize: '.8rem', color: 'var(--s-text-muted)' }}>📅 Cập nhật gần đây</span>
                  <Link to={`/chapters?course_id=${c.id}`} className="s-btn s-btn-primary s-btn-sm">
                    {status === 'notstarted' ? '🚀 Bắt đầu' : status === 'done' ? '🔄 Xem lại' : '▶ Tiếp tục'}
                  </Link>
                </div>
              </div>
            );
          })}
      </div>
    </main>
  );
}
