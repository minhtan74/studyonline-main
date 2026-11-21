import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStudyAction, useStudyRecommendations } from '../../hooks/useStudyRecommendations';
import { filterStudyRecommendations, groupStudyRecommendations, studyCourseOptions, STUDY_PRIORITIES } from '../../utils/studyRecommendations';
import StudyCourseFilter from '../../components/common/StudyCourseFilter';
import StudyRecommendationChapters from '../../components/common/StudyRecommendationChapters';
import '../../assets/css/study-recommendations.css';

export default function Recommendations() {
  const { loading, error, data, progress, progressError, reload } = useStudyRecommendations(true);
  const { busy, openStudy } = useStudyAction();
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const [params, setParams] = useSearchParams();
  const course = /^[1-9]\d*$/.test(params.get('course_id') || '') ? params.get('course_id') : 'all';
  const options = useMemo(() => studyCourseOptions(data, progress), [data, progress]);
  const changeCourse = value => setParams(previous => { const next = new URLSearchParams(previous); if (value === 'all') next.delete('course_id'); else next.set('course_id', value); return next; }, { replace: true });
  const hasFilters = !!search || priority !== 'all' || course !== 'all';
  const clearFilters = () => { setSearch(''); setPriority('all'); changeCourse('all'); };
  const filtered = useMemo(() => data ? filterStudyRecommendations(data, priority, search, course) : null, [data, priority, search, course]);
  const groups = useMemo(() => filtered ? groupStudyRecommendations(filtered, progress) : [], [filtered, progress]);
  useEffect(() => { setExpanded(new Set(groups.length ? [groups[0].id] : [])); }, [groups]);
  const stats = [
    { icon: '📖', label: 'Bài được gợi ý', value: filtered?.rows.length ?? 0, color: 'blue' },
    { icon: '📚', label: 'Khóa học được đề xuất', value: groups.length, color: 'purple' },
    { icon: '🎯', label: 'Bài nên ôn', value: filtered?.rows.filter(row => row.priority === 'review').length ?? 0, color: 'red' },
  ];
  function toggle(id) { setExpanded(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <main className="s-main study-recommendations-page">
    <div className="study-page-header">
      <Link to={`/student/progress${course !== 'all' ? `?course_id=${course}` : ''}`} className="s-btn s-btn-ghost">← Tiến độ học tập</Link>
      <div><h1 className="s-page-title">Gợi ý học tập</h1>
        <p className="s-page-subtitle">Tổng hợp các nội dung nên ôn tập dựa trên kết quả Quiz của tất cả khóa học bạn đã tham gia.</p></div>
    </div>
    <section className="study-overview" aria-label="Thống kê gợi ý theo bộ lọc">
      {stats.map(stat => <div className={`study-stat study-stat-${stat.color}`} key={stat.label}>
        <span className="study-stat-icon" aria-hidden="true">{stat.icon}</span>
        <div><strong>{loading || error ? '—' : stat.value}</strong><span>{stat.label}</span></div>
      </div>)}
    </section>
    <div className="study-filter-bar">
      <StudyCourseFilter courses={options} value={course} onChange={changeCourse} disabled={loading || !!error} />
      <div className="study-priority-filters" role="group" aria-label="Lọc mức ưu tiên">
        {STUDY_PRIORITIES.map(item => <button type="button" key={item.key} aria-pressed={priority === item.key} onClick={() => setPriority(item.key)}>{item.label}</button>)}
      </div>
      <label className="study-search"><span className="study-sr-only">Tìm khóa học, chương hoặc bài học</span>
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm khóa học, chương, bài học…" /></label>
    </div>
    {loading ? <div className="s-card study-empty" role="status">Đang tổng hợp gợi ý từ kết quả Quiz…</div>
      : error ? <div className="s-card study-empty" role="alert"><p>{error}</p><button type="button" className="s-btn s-btn-primary" onClick={reload}>Thử lại</button></div>
      : <>
        <div className="study-results-info"><p>{filtered.rows.length} bài học · {groups.length} khóa học{hasFilters ? ' phù hợp bộ lọc' : ' được đề xuất'}</p>
          <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={reload}>Làm mới</button></div>
        {progressError && <p className="study-muted" role="status">Chưa tải được tiến độ khóa học; các gợi ý vẫn được hiển thị từ kết quả Quiz.</p>}
        {!groups.length ? <div className="s-card study-empty">
          <h2>{hasFilters ? 'Không có gợi ý phù hợp' : !data.hasQuizEvidence ? 'Chưa có dữ liệu Quiz' : 'Chưa có bài học cần ôn'}</h2>
          <p>{hasFilters ? 'Hãy chọn khóa học khác, đổi từ khóa hoặc xem tất cả mức ưu tiên.' : !data.hasQuizEvidence ? 'Hãy làm Quiz để hệ thống có căn cứ gợi ý nội dung cần củng cố.' : 'Các kết quả hiện tại chưa chỉ ra bài học cần ôn. Tiếp tục làm Quiz để kiểm tra thêm kiến thức.'}</p>
          {hasFilters ? <button type="button" className="s-btn s-btn-ghost" onClick={clearFilters}>Xóa bộ lọc</button>
            : <Link className="s-btn s-btn-primary" to="/quiz">Đến danh sách Quiz</Link>}
        </div> : <div className="study-course-groups">
          {groups.map(group => <section className="s-card study-course-group" key={group.id} aria-label={`Gợi ý khóa học: ${group.title}`}>
            <h2><button type="button" className="study-course-toggle" aria-expanded={expanded.has(group.id)} aria-controls={`study-course-${group.id}`} onClick={() => toggle(group.id)}>
              <span className="study-course-icon" aria-hidden="true">📘</span>
              <span className="study-course-name"><strong>{group.title}</strong><small>{group.rows.length} bài học được đề xuất{group.notes.length ? ` · ${group.notes.length} chương cần xem thêm` : ''}</small></span>
              {group.progress && <span className="study-course-progress"><span>Hoàn thành {group.progress.percent}%</span><span className="study-progress-track" role="progressbar" aria-label={`Tiến độ ${group.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={group.progress.percent}><span style={{ width: `${group.progress.percent}%` }} /></span></span>}
              <span className="study-course-chevron" aria-hidden="true">{expanded.has(group.id) ? '⌃' : '⌄'}</span>
            </button></h2>
            <div id={`study-course-${group.id}`} hidden={!expanded.has(group.id)}>
              <StudyRecommendationChapters key={`${group.id}:${priority}:${search}`} group={group} minimumQuestions={data.minimumQuestions} reviewThreshold={data.reviewThreshold} busy={busy} onStudy={openStudy} />
            </div>
          </section>)}
        </div>}
        {course === 'all' && data.unmapped > 0 && <p className="study-muted">Có {data.unmapped} câu trả lời chưa được phân loại nội dung; chưa dùng để chỉ ra bài học cụ thể.</p>}
        <p className="study-method-note">Nên ôn tập: nội dung đủ căn cứ và dưới ngưỡng {data.reviewThreshold}%. Chưa đủ dữ liệu: có câu chưa đúng nhưng chưa đủ {data.minimumQuestions} câu để phân loại. Gợi ý dùng căn cứ mới nhất theo bài học, không cộng trùng các lượt Quiz.</p>
      </>}
  </main>;
}
