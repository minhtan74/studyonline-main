import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import { quizService } from '../../services/quizService';
import WeeklyBarChart from '../../components/common/WeeklyBarChart.jsx';

const EMOJIS = ['🎨', '💻', '📊', '🔬', '🌐', '📱', '🎵', '✏️'];
const COLORS = [
  '#2563EB,#8B5CF6',
  '#0F766E,#06B6D4',
  '#7C3AED,#EC4899',
  '#DC2626,#F59E0B',
  '#059669,#2563EB',
  '#D97706,#EF4444',
];

/** Tương đương _legacy/pages/student/dashboard.html */
export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(null); // null = đang tải
  const [continuePcts, setContinuePcts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [coursesRes] = await Promise.all([courseService.getCourses(), quizService.getQuizzes()]);
      if (cancelled) return;
      const list = coursesRes?.data?.data || [];
      setCourses(list);
      // % ngẫu nhiên cho "Tiếp tục học" — giữ nguyên hành vi mock gốc (Math.random mỗi lần render danh sách)
      setContinuePcts(list.slice(0, 3).map(() => Math.floor(Math.random() * 70) + 10));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="s-main">
      {/* Welcome Banner */}
      <div className="s-welcome">
        <div>
          <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, marginBottom: '.25rem' }}>
            🌟 Chào mừng trở lại
          </p>
          <h1 id="welcomeName">Xin chào, {user?.fullname}! 👋</h1>
          <p>Hãy tiếp tục hành trình học tập hôm nay nhé.</p>
          <Link to="/courses" className="s-btn s-btn-lg" style={{ background: '#fff', color: 'var(--s-primary)', marginTop: '.25rem' }}>
            Khám phá khóa học →
          </Link>
        </div>
      </div>

      {/* Stats Grid — các số liệu placeholder giữ nguyên như bản gốc (chưa nối API thật) */}
      <div className="s-stats-grid">
        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(37,99,235,.1)' }}>
              📚
            </div>
            <span className="s-stat-trend trend-up">+2</span>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-primary)' }} id="statTotal">
            {courses === null ? '—' : courses.length || '—'}
          </div>
          <div className="s-stat-label">Tổng khóa học</div>
        </div>

        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(245,158,11,.1)' }}>
              ⏳
            </div>
            <span className="s-stat-trend trend-warn">Đang học</span>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-warning)' }} id="statInProgress">
            3
          </div>
          <div className="s-stat-label">Đang theo học</div>
        </div>

        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(16,185,129,.1)' }}>
              ✅
            </div>
            <span className="s-stat-trend trend-up">+1</span>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-success)' }} id="statDone">
            2
          </div>
          <div className="s-stat-label">Đã hoàn thành</div>
        </div>

        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(139,92,246,.1)' }}>
              📝
            </div>
            <span className="s-stat-trend trend-up">8.5</span>
          </div>
          <div className="s-stat-value" style={{ color: '#8B5CF6' }} id="statQuizAvg">
            8.5
          </div>
          <div className="s-stat-label">Điểm quiz TB</div>
        </div>

        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(245,158,11,.1)' }}>
              🏆
            </div>
            <span className="s-stat-trend trend-up">Mới</span>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-warning)' }} id="statCerts">
            2
          </div>
          <div className="s-stat-label">Chứng chỉ đạt</div>
        </div>
      </div>

      {/* Charts + Recent Activity */}
      <div className="s-grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Weekly Chart */}
        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">📈 Tiến độ học trong tuần</span>
            <span className="s-badge s-badge-blue">Tuần này</span>
          </div>
          <div className="s-card-body">
            <div className="s-chart-wrap">
              <WeeklyBarChart data={[2, 5, 3, 7, 4, 6, 2]} />
            </div>
          </div>
        </div>

        {/* Recent Activity — dữ liệu mẫu tĩnh giữ nguyên như bản gốc */}
        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">🕐 Hoạt động gần đây</span>
            <Link to="/student/progress" className="s-btn s-btn-ghost s-btn-sm">
              Xem tất cả
            </Link>
          </div>
          <div className="s-card-body">
            <div className="s-activity-list" id="activityList">
              <div className="s-activity-item">
                <div className="s-activity-icon" style={{ background: 'rgba(37,99,235,.1)' }}>
                  📘
                </div>
                <div className="s-activity-body">
                  <p>
                    Hoàn thành bài: <strong>Giới thiệu HTML cơ bản</strong>
                  </p>
                  <span>2 giờ trước</span>
                </div>
              </div>
              <div className="s-activity-item">
                <div className="s-activity-icon" style={{ background: 'rgba(16,185,129,.1)' }}>
                  ✅
                </div>
                <div className="s-activity-body">
                  <p>
                    Đạt quiz: <strong>CSS Fundamentals</strong> — 9/10 điểm
                  </p>
                  <span>Hôm qua</span>
                </div>
              </div>
              <div className="s-activity-item">
                <div className="s-activity-icon" style={{ background: 'rgba(245,158,11,.1)' }}>
                  🏆
                </div>
                <div className="s-activity-body">
                  <p>
                    Nhận chứng chỉ: <strong>Web Design Basics</strong>
                  </p>
                  <span>3 ngày trước</span>
                </div>
              </div>
              <div className="s-activity-item">
                <div className="s-activity-icon" style={{ background: 'rgba(139,92,246,.1)' }}>
                  📝
                </div>
                <div className="s-activity-body">
                  <p>
                    Bắt đầu khóa học: <strong>JavaScript ES6+</strong>
                  </p>
                  <span>5 ngày trước</span>
                </div>
              </div>
              <div className="s-activity-item">
                <div className="s-activity-icon" style={{ background: 'rgba(37,99,235,.1)' }}>
                  📘
                </div>
                <div className="s-activity-body">
                  <p>
                    Hoàn thành bài: <strong>Flexbox Layout</strong>
                  </p>
                  <span>1 tuần trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Courses */}
      <div className="s-card" style={{ marginBottom: '1.75rem' }}>
        <div className="s-card-header">
          <span className="s-card-title">▶️ Tiếp tục học</span>
          <Link to="/student/my-courses" className="s-btn s-btn-ghost s-btn-sm">
            Xem tất cả
          </Link>
        </div>
        <div className="s-card-body">
          <div id="continueList" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
            {courses === null && <div style={{ color: 'var(--s-text-muted)', fontSize: '.9rem', padding: '1rem 0' }}>Đang tải khóa học...</div>}
            {courses !== null && courses.length === 0 && (
              <div className="s-empty">
                <div className="icon">📚</div>
                <h3>Chưa có khóa học nào</h3>
                <p>Hãy đăng ký khóa học đầu tiên!</p>
                <Link to="/courses" className="s-btn s-btn-primary" style={{ marginTop: '1rem' }}>
                  Khám phá ngay
                </Link>
              </div>
            )}
            {courses !== null &&
              courses.slice(0, 3).map((c, i) => {
                const pct = continuePcts[i] ?? 10;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid var(--s-border)',
                      borderRadius: '10px',
                      background: 'var(--s-surface-2)',
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg,var(--s-primary),#8B5CF6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}
                    >
                      📘
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{ fontWeight: 700, fontSize: '.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {c.title || 'Khóa học'}
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--s-text-muted)', marginBottom: '.5rem' }}>{pct}% hoàn thành</div>
                      <div className="s-progress">
                        <div className="s-progress-bar" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                    <Link to={`/chapters?course_id=${c.id}`} className="s-btn s-btn-primary s-btn-sm" style={{ flexShrink: 0 }}>
                      ▶
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Suggested Courses */}
      <div className="s-card">
        <div className="s-card-header">
          <span className="s-card-title">💡 Khóa học đề xuất</span>
          <Link to="/student/courses" className="s-btn s-btn-primary s-btn-sm">
            Xem tất cả
          </Link>
        </div>
        <div className="s-card-body">
          <div className="s-course-grid" id="suggestedList">
            {courses === null && <div style={{ color: 'var(--s-text-muted)', fontSize: '.9rem' }}>Đang tải...</div>}
            {courses !== null && courses.length === 0 && <p style={{ color: 'var(--s-text-muted)' }}>Chưa có khóa học nào.</p>}
            {courses !== null &&
              courses.slice(0, 6).map((c, i) => (
                <div key={c.id} className="s-course-card">
                  <div className="s-course-thumb" style={{ background: `linear-gradient(135deg,${COLORS[i % COLORS.length]})` }}>
                    <span>{EMOJIS[i % EMOJIS.length]}</span>
                  </div>
                  <div className="s-course-body">
                    <h3>{c.title || 'Khóa học'}</h3>
                    <p className="teacher">👨‍🏫 Giảng viên StudyOnline</p>
                    <div className="s-course-meta">
                      <span>📖 Xem bài học</span>
                    </div>
                  </div>
                  <div className="s-course-footer">
                    <span className="s-badge s-badge-blue">Mới nhất</span>
                    <Link to={`/chapters?course_id=${c.id}`} className="s-btn s-btn-primary s-btn-sm">
                      Học ngay
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
