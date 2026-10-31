import { Link } from 'react-router-dom';
import { formatStudyDate } from '../../utils/studyDate';

export default function StudyRecommendationReason({ row, minimumQuestions = 5, reviewThreshold = 70 }) {
  const uncertain = row.priority === 'check';
  return <>
    <p>{uncertain ? `Chưa đủ dữ liệu: ghi nhận ${row.evidence.answered} câu khác nhau và có câu trả lời sai. Cần ít nhất ${minimumQuestions} câu để phân loại; chưa kết luận mức độ nắm vững kiến thức.` : `Tỷ lệ đúng ${row.evidence.avg_score}% dưới ngưỡng ôn tập ${reviewThreshold}%. Nên củng cố nội dung bài học này.`}</p>
    {!!row.evidence.sources?.length && <>
      <strong>Kết quả Quiz làm căn cứ</strong>
      <ul>{row.evidence.sources.map((source, index) => <li key={`${source.result_id}-${index}`}>
        <Link to={`/student/quiz-result?result_id=${source.result_id}`}>{source.quiz_title}</Link>
        <span> · đúng {source.correct}/{source.answered} câu · {formatStudyDate(source.submitted_at)}</span>
      </li>)}</ul>
    </>}
  </>;
}
