import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudyKnowledgeTopics from './StudyKnowledgeTopics';
import './KnowledgeAssessment.css';

export default function KnowledgeAssessment({ data, title = 'Kết quả theo chương và bài học', showReview = false, answers = [], current = false, reviewOnly = false, onStudy, practiceItems = [] }) {
  const [limit, setLimit] = useState(3);
  useEffect(() => { setLimit(3); }, [data]);
  if (!data) return null;
  const units = data.units || [];
  const chapters = units.filter((u) => u.kind === 'chapter');
  const multipleCourses = new Set(chapters.map((ch) => ch.course_id)).size > 1;
  const uncertain = units.filter(unit => !unit.sufficient_data);
  const hasWeakTopic = unit => (unit.review_topics || []).some(topic => topic.needs_review);
  const needsAttention = unit => unit.needs_review || hasWeakTopic(unit) || (!unit.sufficient_data && unit.correct < unit.answered);
  const ordered = list => [...list].sort((a,b) => Number(a.avg_score) - Number(b.avg_score) || Number(b.answered) - Number(a.answered));
  const reviewLessons = units.filter(unit => unit.kind === 'lesson' && unit.sufficient_data && (unit.needs_review || hasWeakTopic(unit)));
  const reviewTargets = ordered([...reviewLessons, ...chapters.filter(chapter => chapter.sufficient_data && chapter.needs_review && !reviewLessons.some(lesson => lesson.course_id === chapter.course_id && lesson.chapter_id === chapter.id))]);
  function unitSummary(unit, actionable = true) {
    const practice = practiceItems.find((item) => item.knowledge_evidence?.course_id === unit.course_id && item.knowledge_evidence?.kind === unit.kind && item.knowledge_evidence?.id === unit.id && item.practice_url);
    const wrongAnswers = answers.filter((answer) => !answer.is_right && (unit.question_ids || []).includes(answer.question_id));
    return <>
      <div className="knowledge-unit-row">
      <strong className="knowledge-unit-name">{unit.title}{unit.available === false ? ' (nội dung đã gỡ)' : ''}</strong>
      <span className="knowledge-unit-result">
        <span>Đúng {unit.correct}/{unit.answered} câu{unit.sufficient_data ? ` · ${unit.avg_score}%` : ` · Cần ít nhất ${data.min_questions || 5} câu khác nhau`}</span>
        <strong className={`knowledge-status ${!unit.sufficient_data ? 'knowledge-status-insufficient' : unit.needs_review || hasWeakTopic(unit) ? 'knowledge-status-review' : 'knowledge-status-good'}`}>{!unit.sufficient_data ? 'Chưa đủ dữ liệu' : unit.needs_review ? 'Nên ôn tập' : hasWeakTopic(unit) ? 'Có chủ đề cần ôn' : 'Đạt ngưỡng'}</strong>
      </span>
      {actionable && needsAttention(unit) && <div className="knowledge-unit-actions">
        {unit.available !== false && <Link className="s-btn s-btn-primary s-btn-sm" onClick={onStudy ? (event) => onStudy(event, { knowledge_evidence: unit }, unit.kind === 'lesson' ? `/lesson?id=${unit.id}` : `/chapters?course_id=${unit.course_id}&chapter_id=${unit.id}`) : undefined} to={unit.kind === 'lesson' ? `/lesson?id=${unit.id}` : `/chapters?course_id=${unit.course_id}&chapter_id=${unit.id}`}>
          {!unit.sufficient_data ? 'Xem lại nội dung' : unit.kind === 'lesson' ? 'Ôn bài học' : 'Ôn chương'}
        </Link>}
        {practice && <Link className="s-btn s-btn-outline s-btn-sm" to={practice.practice_url} onClick={onStudy ? (event) => onStudy(event, { knowledge_evidence: unit }, practice.practice_url) : undefined}>{practice.practice_label || 'Làm bài luyện'}</Link>}
        {wrongAnswers.length > 0 && <details>
          <summary style={{ cursor: 'pointer', padding: '.4rem 0', fontSize: '.85rem' }}>Xem {wrongAnswers.length} câu sai</summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', padding: '.4rem 0' }}>{wrongAnswers.map((answer) => <a key={answer.question_id} href={`#quiz-question-${answer.question_id}`}>Câu {answers.indexOf(answer) + 1}</a>)}</div>
        </details>}
      </div>}
      </div>
      {showReview && needsAttention(unit) && <details className="knowledge-evidence" open={!current}>
        <summary style={{ cursor: 'pointer' }}>Phần kiến thức cần ôn trong {unit.kind === 'lesson' ? 'bài học' : 'chương'}</summary>
        <p>{!unit.sufficient_data ? 'Có câu sai nhưng chưa đủ số câu để kết luận yếu.' : unit.needs_review ? `Tỷ lệ đúng ${unit.avg_score}% dưới ngưỡng ôn tập ${data.review_threshold || 70}%.` : 'Điểm tổng của bài đạt ngưỡng, nhưng có chủ đề riêng đủ căn cứ cần ôn tập.'}</p>
        <StudyKnowledgeTopics evidence={unit} />
      </details>}
    </>;
  }
  function row(unit) {
    const isLesson = unit.kind === 'lesson';
    const url = isLesson ? `/lesson?id=${unit.id}` : `/chapters?course_id=${unit.course_id}&chapter_id=${unit.id}`;
    return <tr key={`${unit.course_id}-${unit.kind}-${unit.id}`}>
      <td style={{ padding: '.5rem', paddingLeft: isLesson ? '1.4rem' : '.5rem', fontWeight: isLesson ? 400 : 700 }}>
        {unit.available === false ? <span>{unit.title} (nội dung đã gỡ)</span> : <Link to={url}>{unit.title}</Link>}
        {!isLesson && multipleCourses && <small style={{ display: 'block', fontWeight: 400 }}>{unit.course_title}</small>}
      </td>
      <td style={{ padding: '.5rem', whiteSpace: 'nowrap' }}>{unit.correct}/{unit.answered}{unit.sufficient_data ? ` · ${unit.avg_score}%` : ''}</td>
      <td style={{ padding: '.5rem', color: unit.needs_review ? '#b45309' : 'inherit' }}>
        {!unit.sufficient_data ? 'Chưa đủ dữ liệu' : unit.needs_review ? 'Nên ôn tập' : 'Đạt ngưỡng'}
      </td>
    </tr>;
  }
  return <section className="knowledge-assessment" style={{ marginBottom: '1rem' }} aria-label={title}>
    <h3 style={{ fontSize: '1rem', marginBottom: '.6rem' }}>{title}</h3>
    {showReview && units.length > 0 && <>
      <p className="knowledge-scope">{current ? 'Tổng hợp từ kết quả quiz gần nhất của từng bài trong khóa.' : 'Chỉ phản ánh lượt làm đang xem; không thay thế gợi ý tổng hợp trong khóa.'}</p>
      <section aria-label="Nội dung nên ôn tập">
        <h4>Nên ôn tập ({reviewTargets.length})</h4>
        {reviewTargets.length ? <>
          {reviewTargets.slice(0, limit).map(unit => <div className="knowledge-chapter" key={`${unit.course_id}-${unit.kind}-${unit.id}`}>
            <p className="knowledge-context">{unit.kind === 'lesson' ? unit.chapter_name : 'Đánh giá cấp chương · Chưa xác định bài cụ thể'}</p>
            {unitSummary(unit)}
          </div>)}
          {reviewTargets.length > 3 && <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={() => setLimit(limit === 3 ? reviewTargets.length : 3)}>{limit === 3 ? `Xem thêm ${reviewTargets.length - 3} nội dung nên ôn` : 'Thu gọn nội dung nên ôn'}</button>}
        </> : <p className="knowledge-scope">Chưa có nội dung đủ căn cứ để đề xuất ôn tập từ dữ liệu này.</p>}
      </section>
      {uncertain.length > 0 && <details className="knowledge-insufficient">
        <summary>Chưa đủ dữ liệu ({uncertain.length} mục)</summary>
        <p className="knowledge-scope">Chưa đủ {data.min_questions || 5} câu khác nhau để phân loại. Có câu sai thì bạn có thể xem lại; trả lời đúng ít câu cũng chưa đủ để kết luận đã nắm vững.</p>
        {ordered(uncertain).map(unit => <div className="knowledge-chapter" key={`${unit.course_id}-${unit.kind}-${unit.id}`}>
          <p className="knowledge-context">{unit.kind === 'chapter' ? 'Chương' : unit.chapter_name}</p>{unitSummary(unit)}
        </div>)}
      </details>}
    </>}
    {!units.length && <p>Chưa có câu hỏi được phân loại theo chương/bài trong dữ liệu này.</p>}
    {!reviewOnly && !!chapters.length && <details open={showReview ? undefined : true}><summary style={{ cursor: 'pointer', marginBottom: '.5rem' }}>Xem bảng kết quả chi tiết theo chương/bài</summary><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', textAlign: 'left', fontSize: '.85rem', borderCollapse: 'collapse' }}>
      <thead><tr><th style={{ padding: '.5rem' }}>Phần kiến thức</th><th style={{ padding: '.5rem' }}>Số câu đúng</th><th style={{ padding: '.5rem' }}>Đánh giá</th></tr></thead>
      <tbody>{chapters.flatMap((ch) => [row(ch), ...units.filter((u) => u.kind === 'lesson' && u.course_id === ch.course_id && u.chapter_id === ch.id).map(row)])}</tbody>
    </table></div></details>}
    {data.unmapped_answers > 0 && <p style={{ fontSize: '.8rem' }}>{data.unmapped_answers} câu trả lời chưa xác định chương. Các câu này vẫn tính điểm tổng; giảng viên cần bổ sung phân loại để gợi ý cụ thể.</p>}
    <p style={{ fontSize: '.78rem', color: 'var(--s-text-muted)' }}>Cần ít nhất {data.min_questions || 5} câu khác nhau để phân loại; dưới {data.review_threshold || 70}% thì ưu tiên ôn. Đây là ngưỡng hỗ trợ học tập ban đầu.</p>
  </section>;
}
