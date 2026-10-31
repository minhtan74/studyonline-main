import { Link } from 'react-router-dom';
import StudyRecommendationRows from './StudyRecommendationRows';

export default function StudyRecommendationChapters({ group, minimumQuestions, reviewThreshold, busy, onStudy }) {
  const chapters = new Map();
  for (const row of group.rows) {
    const id = Number(row.evidence.chapter_id) || 'unassigned';
    if (!chapters.has(id)) chapters.set(id, { id, title: row.chapterTitle || 'Bài học chưa có chương', rows: [], notes: [] });
    chapters.get(id).rows.push(row);
  }
  for (const note of group.notes) {
    const id = Number(note.evidence.id);
    if (!chapters.has(id)) chapters.set(id, { id, title: note.title, rows: [], notes: [] });
    chapters.get(id).notes.push(note);
  }
  return <div className="study-chapter-groups">
    {[...chapters.values()].map((chapter, index) => <details className="study-chapter-group" key={chapter.id} open={index === 0}>
      <summary className="study-chapter-toggle">
        <span className="study-chapter-caret" aria-hidden="true">›</span>
        <span className="study-chapter-title">{chapter.title}</span>
        <span className="study-chapter-count">{chapter.rows.length ? `${chapter.rows.length} bài được gợi ý` : 'Cần xem thêm'}</span>
      </summary>
      {!!chapter.rows.length && <StudyRecommendationRows rows={chapter.rows} minimumQuestions={minimumQuestions} reviewThreshold={reviewThreshold} busy={busy} onStudy={onStudy} />}
      {chapter.notes.map(note => <div className="study-chapter-note" key={note.key}>
        <p>Gợi ý ở cấp chương; chưa xác định được bài học cụ thể cần ưu tiên. Chương không được tính thành một bài học trong thống kê.</p>
        <p>Quiz: đúng {note.evidence.correct}/{note.evidence.answered} câu{note.evidence.sufficient_data ? ` · ${note.evidence.avg_score}%` : ''}{!note.evidence.sufficient_data ? ' · Chưa đủ dữ liệu để phân loại' : ''}</p>
        <Link className="s-btn s-btn-ghost s-btn-sm" to={note.url} onClick={event => onStudy(event, note)}>Xem chương</Link>
        {!note.evidence.sufficient_data && <Link to="/quiz" className="study-practice-link">Luyện thêm Quiz</Link>}
      </div>)}
    </details>)}
  </div>;
}
