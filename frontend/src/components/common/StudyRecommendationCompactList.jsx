import { Link } from 'react-router-dom';
import { formatStudyDate } from '../../utils/studyDate';
import { STUDY_PRIORITY_LABELS, studyPracticeAction } from '../../utils/studyRecommendations';

export default function StudyRecommendationCompactList({ rows, expanded, onExpand, minimumQuestions, reviewThreshold, busy, onStudy }) {
  return <div className="study-compact-list">
    {rows.map(row => {
      const uncertain = row.evidence.sufficient_data === false;
      const priority = uncertain ? 'check' : 'review';
      const label = STUDY_PRIORITY_LABELS[priority];
      const action = uncertain ? studyPracticeAction(row) : { url: row.url, label: 'Ôn tập' };
      const reasonId = `study-summary-reason-${row.courseId}-${row.lessonId}`;
      return <article className="study-compact-item" key={row.key}>
        <div className="study-compact-row">
          <div className="study-compact-topic">
            <h3 title={row.title}>{row.title}</h3>
            <p title={`${row.courseTitle || 'Chưa có tên khóa học'} · ${row.chapterTitle || 'Chưa có tên chương'}`}>{row.courseTitle || 'Chưa có tên khóa học'} · {row.chapterTitle || 'Chưa có tên chương'}</p>
          </div>
          <div className="study-compact-score" aria-label={uncertain ? `Đã trả lời ${row.evidence.answered}/${minimumQuestions} câu tối thiểu, có ${Math.max(0, row.evidence.answered - row.evidence.correct)} câu sai; chưa đủ dữ liệu` : `Quiz: đúng ${row.evidence.correct}/${row.evidence.answered} câu đã trả lời, ${row.evidence.avg_score}%`}>
            {uncertain ? <><span>Đã trả lời</span><strong>{row.evidence.answered}/{minimumQuestions} câu</strong><span>{Math.max(0, row.evidence.answered - row.evidence.correct)} câu sai</span></>
              : <><strong>{row.evidence.correct}/{row.evidence.answered} câu</strong><span>{row.evidence.avg_score}% đúng</span></>}
          </div>
          <div className="study-compact-status"><span className={`study-priority study-priority-${priority}`}>{label}</span>
            <button type="button" className="study-why-btn" aria-label={`Vì sao gợi ý: ${row.title}`} aria-expanded={expanded === row.key} aria-controls={reasonId} onClick={() => onExpand(expanded === row.key ? null : row.key)}>Vì sao?</button>
          </div>
          <Link className="study-action-btn study-action-primary study-compact-action" to={action.url} aria-label={`${action.label}: ${row.title}`} aria-disabled={!!busy} onClick={event => onStudy(event, { ...row, url: action.url })}>{busy === row.key ? 'Đang mở…' : action.label}</Link>
        </div>
        {expanded === row.key && <div id={reasonId} className="study-compact-reason">
          <p>{uncertain ? `Chưa đủ dữ liệu: ghi nhận ${row.evidence.answered} câu khác nhau và có câu trả lời sai. Cần ít nhất ${minimumQuestions} câu để phân loại; chưa kết luận mức độ nắm vững kiến thức.` : `Tỷ lệ đúng ${row.evidence.avg_score}% dưới ngưỡng ôn tập ${reviewThreshold}%. Nên củng cố nội dung bài học này.`}</p>
          <p>Câu có cùng nội dung và bộ phương án được tính một lần, dùng kết quả mới nhất.</p>
          {row.evidence.identity_reconstructed && <p>Dữ liệu cũ dùng nội dung câu hỏi hiện có để nhận diện bản sao.</p>}
          {!!row.evidence.sources?.length && <><strong>Kết quả Quiz làm căn cứ</strong><ul>{row.evidence.sources.map((source, index) => <li key={`${source.result_id}-${index}`}><Link to={`/student/quiz-result?result_id=${source.result_id}`}>{source.quiz_title}</Link> · đúng {source.correct}/{source.answered} câu · {formatStudyDate(source.submitted_at)}</li>)}</ul></>}
        </div>}
      </article>;
    })}
  </div>;
}
