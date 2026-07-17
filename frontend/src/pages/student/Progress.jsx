import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import WeeklyBarChart from '../../components/common/WeeklyBarChart.jsx';
import ProgressDoughnut from '../../components/common/ProgressDoughnut.jsx';

/** Tương đương _legacy/pages/student/progress.html — toàn bộ số liệu lấy từ API thật */
export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [progressRes, weeklyRes] = await Promise.all([progressService.getProgress(), progressService.getWeeklyProgress()]);
      if (cancelled) return;
      setProgressData(progressRes?.data?.data || null);
      setWeeklyData(weeklyRes?.data?.data || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLessons = progressData?.total_lessons ?? 0;
  const doneLessons = progressData?.done_lessons ?? 0;
  const remLessons = totalLessons - doneLessons;
  const totalSec = progressData?.total_watched_sec ?? 0;

  const hrs = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const hoursLabel = hrs > 0 ? `${hrs}h${min > 0 ? min + 'm' : ''}` : min > 0 ? `${min}m` : '0m';

  const overall = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const weekLabels = weeklyData.map((d) => d.label);
  const weekCounts = weeklyData.map((d) => d.count);

  const courses = progressData?.courses || [];

  return (
    <main className="s-main">
      <div className="s-page-title">📈 Tiến độ học tập</div>
      <div className="s-page-subtitle">Theo dõi hành trình học tập của bạn</div>

      {/* Stats overview */}
      <div className="s-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(37,99,235,.1)' }}>
              📘
            </div>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-primary)' }} id="pTotalLessons">
            {loading ? '—' : totalLessons || '0'}
          </div>
          <div className="s-stat-label">Tổng bài học</div>
        </div>
        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(16,185,129,.1)' }}>
              ✅
            </div>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-success)' }} id="pDoneLessons">
            {loading ? '—' : doneLessons || '0'}
          </div>
          <div className="s-stat-label">Đã hoàn thành</div>
        </div>
        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(245,158,11,.1)' }}>
              ⏳
            </div>
          </div>
          <div className="s-stat-value" style={{ color: 'var(--s-warning)' }} id="pRemLessons">
            {loading ? '—' : remLessons || '0'}
          </div>
          <div className="s-stat-label">Còn lại</div>
        </div>
        <div className="s-stat-card">
          <div className="s-stat-top">
            <div className="s-stat-icon" style={{ background: 'rgba(139,92,246,.1)' }}>
              ⏱
            </div>
          </div>
          <div className="s-stat-value" style={{ color: '#8B5CF6' }} id="pHours">
            {loading ? '—' : hoursLabel}
          </div>
          <div className="s-stat-label">Tổng thời gian học</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="s-grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">📊 Bài học hoàn thành theo tuần</span>
          </div>
          <div className="s-card-body">
            <div className="s-chart-wrap">
              <WeeklyBarChart data={weekCounts} labels={weekLabels} />
            </div>
          </div>
        </div>

        <div className="s-card">
          <div className="s-card-header">
            <span className="s-card-title">🍩 Tỷ lệ hoàn thành tổng thể</span>
          </div>
          <div className="s-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div className="s-chart-wrap" style={{ width: 180, height: 180 }}>
              <ProgressDoughnut completed={doneLessons} total={totalLessons} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--s-primary)' }} id="overallPct">
                {overall}%
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--s-text-muted)' }}>Tổng tiến độ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-course progress */}
      <div className="s-card">
        <div className="s-card-header">
          <span className="s-card-title">📚 Tiến độ từng khóa học</span>
        </div>
        <div className="s-card-body">
          <div id="courseProgressList" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loading && <div style={{ color: 'var(--s-text-muted)' }}>Đang tải...</div>}

            {!loading && courses.length === 0 && (
              <div className="s-empty">
                <div className="icon">📭</div>
                <h3>Bạn chưa đăng ký khóa học nào</h3>
                <p>Hãy khám phá và đăng ký khóa học để bắt đầu học!</p>
                <Link to="/student/courses" className="s-btn s-btn-primary s-btn-sm">
                  Khám phá khóa học
                </Link>
              </div>
            )}

            {!loading &&
              courses.map((c) => {
                const total = parseInt(c.total_lessons, 10) || 0;
                const done = parseInt(c.done_lessons, 10) || 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const cHrs = Math.floor((c.watched_sec_total || 0) / 3600);
                const cMin = Math.floor(((c.watched_sec_total || 0) % 3600) / 60);
                const timeStr = cHrs > 0 ? `${cHrs}h ${cMin}m` : cMin > 0 ? `${cMin}m` : '0m';

                return (
                  <div
                    key={c.course_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid var(--s-border)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg,var(--s-primary),#8B5CF6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        flexShrink: 0,
                      }}
                    >
                      📘
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '.9rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '60%',
                          }}
                        >
                          {c.course_title || 'Khóa học'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '.78rem', color: 'var(--s-text-muted)' }}>
                            {done}/{total} bài
                          </span>
                          <span style={{ fontWeight: 700, color: pct === 100 ? 'var(--s-success)' : 'var(--s-primary)' }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="s-progress">
                        <div className={`s-progress-bar${pct === 100 ? ' green' : ''}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '.4rem', fontSize: '.75rem', color: 'var(--s-text-muted)' }}>
                        <span>✅ {done} hoàn thành</span>
                        <span>⏳ {total - done} còn lại</span>
                        <span>⏱ {timeStr} đã học</span>
                        {pct === 100 && <span style={{ color: 'var(--s-success)', fontWeight: 700 }}>🏆 Hoàn thành!</span>}
                      </div>
                    </div>
                    <Link to={`/chapters?course_id=${c.course_id}`} className="s-btn s-btn-outline s-btn-sm" style={{ flexShrink: 0 }}>
                      Xem
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
