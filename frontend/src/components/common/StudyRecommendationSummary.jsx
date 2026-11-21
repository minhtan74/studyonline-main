import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import StudyRecommendationCompactList from './StudyRecommendationCompactList';
import { filterStudyRecommendations, priorityRank, studyCountLabel, studyCourseOptions } from '../../utils/studyRecommendations';
import StudyCourseFilter from './StudyCourseFilter';
import { useStudyAction, useStudyRecommendations } from '../../hooks/useStudyRecommendations';
import '../../assets/css/study-recommendations.css';

export default function StudyRecommendationSummary({ courses = [], fixedCourseId = null, pageSize = 5 }) {
  const { data, loading, error, reload } = useStudyRecommendations();
  const { busy, openStudy } = useStudyAction();
  const [limit, setLimit] = useState(pageSize);
  const [expanded, setExpanded] = useState(null);
  const [params, setParams] = useSearchParams();
  const course = fixedCourseId ? String(fixedCourseId) : /^[1-9]\d*$/.test(params.get('course_id') || '') ? params.get('course_id') : 'all';
  const options = useMemo(() => studyCourseOptions(data, courses), [data, courses]);
  const filtered = useMemo(() => data ? filterStudyRecommendations(data, 'all', '', course) : null, [data, course]);
  const changeCourse = value => setParams(previous => { const next = new URLSearchParams(previous); if (value === 'all') next.delete('course_id'); else next.set('course_id', value); return next; }, { replace: true });
  const rows = useMemo(() => [...(filtered?.rows || [])].sort((a, b) => {
    const rank = row => row.evidence.sufficient_data === false ? 3 : priorityRank(row.priority);
    return rank(a) - rank(b) || Number(a.evidence.avg_score) - Number(b.evidence.avg_score) || Number(b.evidence.answered) - Number(a.evidence.answered);
  }), [filtered]);
  const reviewRows = rows;
  useEffect(() => { setLimit(pageSize); setExpanded(null); }, [data, course, pageSize]);
  const listProps = { expanded, onExpand: setExpanded, minimumQuestions: data?.minimumQuestions, reviewThreshold: data?.reviewThreshold, busy, onStudy: openStudy };
  return <section className="s-card study-recommendation-summary" aria-label="Tóm tắt gợi ý học tập">
    <div className="s-card-header study-summary-header">
      <h2 className="s-card-title">🎯 Gợi ý học tập cho bạn</h2>
      <Link to={`/student/recommendations${course !== 'all' ? `?course_id=${course}` : ''}`} className="s-btn s-btn-ghost s-btn-sm">Xem tất cả gợi ý</Link>
    </div>
    <div className="s-card-body">
      {!fixedCourseId && <div className="study-summary-course-filter"><StudyCourseFilter courses={options} value={course} onChange={changeCourse} disabled={loading || !!error} /></div>}
      {loading ? <p role="status">Đang tải gợi ý học tập…</p> : error ? <div role="alert"><p>{error}</p><button className="s-btn s-btn-ghost s-btn-sm" onClick={reload}>Thử lại</button></div>
        : rows.length ? <>
          <p className="study-muted">{studyCountLabel(rows)}{course === 'all' ? ' từ tất cả khóa đã tham gia.' : ' trong khóa học đã chọn.'}</p>
          {reviewRows.length ? <section aria-label="Bài nên ôn tập">
            <StudyRecommendationCompactList rows={reviewRows.slice(0, limit)} {...listProps} />
            <div className="study-summary-footer">
              <span className="study-muted" role="status">Đang hiển thị {Math.min(limit, reviewRows.length)}/{reviewRows.length} bài nên ôn</span>
              <div>{limit < reviewRows.length && <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={() => setLimit(previous => previous + pageSize)}>Xem thêm bài nên ôn</button>}
                {limit > pageSize && <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={() => { setLimit(pageSize); setExpanded(null); }}>Thu gọn bài nên ôn</button>}</div>
            </div>
          </section> : <p className="study-muted">Chưa có bài đủ căn cứ để đề xuất ôn tập{course !== 'all' ? ' trong khóa học này' : ''}.</p>}
        </> : <p className="study-muted">{filtered?.chapterNotes.length ? 'Có nội dung cần ôn ở cấp chương; xem tất cả để biết chi tiết.' : course !== 'all' ? 'Khóa học này chưa có bài học cần ôn từ kết quả Quiz hiện tại.' : !data?.hasQuizEvidence ? 'Chưa có dữ liệu Quiz để gợi ý nội dung cần ôn.' : 'Chưa ghi nhận bài học cần ôn từ kết quả Quiz hiện tại.'}</p>}
    </div>
  </section>;
}
