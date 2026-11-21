import { Link } from 'react-router-dom';
import StudyKnowledgeTopics from './StudyKnowledgeTopics';

const labels = { review: 'Nên ôn tập', check: 'Chưa đủ dữ liệu' };
export default function StudyRecommendationRows({ rows, minimumQuestions = 5, reviewThreshold = 70, busy, onStudy }) {
  return <div className="study-suggestion-rows">
    {rows.map(row => <article className="study-suggestion-row" key={row.key} aria-label={row.title}>
      <div className="study-suggestion-topic">
        <h3>{row.title}</h3>
        <p className="study-suggestion-course">Khóa học: {row.courseTitle || 'Chưa có tên khóa học'}</p>
        <p>{row.chapterTitle || 'Chưa có tên chương'}</p>
        <div className="study-suggestion-score">Quiz: đúng {row.evidence.correct}/{row.evidence.answered} câu · {row.evidence.avg_score}%</div>
      </div>
      <div className="study-suggestion-reason">
        {!row.evidence.sufficient_data ? <><strong>Chưa đủ dữ liệu</strong><p>Có câu trả lời chưa đúng, nhưng mới ghi nhận {row.evidence.answered} câu khác nhau. Cần ít nhất {minimumQuestions} câu để phân loại; hãy luyện thêm Quiz.</p></>
          : <p>Tỷ lệ đúng {row.evidence.avg_score}% dưới ngưỡng ôn tập {reviewThreshold}%. Nên củng cố nội dung bài học này.</p>}
        <StudyKnowledgeTopics evidence={row.evidence} />
      </div>
      <span className={`study-priority study-priority-${row.priority}`}>{labels[row.priority]}</span>
      <div className="study-suggestion-actions">
        <Link className="study-action-btn study-action-primary" to={row.url} aria-label={`Ôn tập: ${row.title}`} aria-disabled={!!busy}
          onClick={event => onStudy(event, row)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v15M3 4.5c3-1 6-.5 9 1.5 3-2 6-2.5 9-1.5v14c-3-1-6-.5-9 1.5-3-2-6-2.5-9-1.5z" /></svg>
          <span>{busy === row.key ? 'Đang mở…' : 'Ôn tập'}</span>
        </Link>
        {!row.evidence.sufficient_data && <Link className="study-action-btn study-action-secondary" to={row.practiceUrl} aria-label={`Luyện Quiz: ${row.title}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 3h6v4H9zM9 12h6M9 16h4" /></svg>
          <span>Luyện Quiz</span>
        </Link>}
      </div>
    </article>)}
  </div>;
}
