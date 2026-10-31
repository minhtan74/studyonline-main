import { useState } from 'react';
import TopicScoreBar from './TopicScoreBar.jsx';

const FILTERS = [
  { id: 'all', label: 'Tất cả', match: () => true },
  { id: 'review', label: 'Cần củng cố', match: t => ['Weak', 'Average'].includes(t.status) },
  { id: 'strong', label: 'Đạt ngưỡng', match: t => ['Good', 'Excellent'].includes(t.status) },
  { id: 'pending', label: 'Chưa đủ dữ liệu', match: t => t.status === 'Insufficient' },
];
const rank = t => ['Weak', 'Average'].includes(t.status) ? 0 : t.status === 'Insufficient' ? 1 : 2;
const PAGE_SIZE = 5;

export default function TopicResults({ topics }) {
  const [course, setCourse] = useState('all');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const courses = [...new Map(topics.map(t => [String(t.course_id), t.course_title || 'Khóa học'])).entries()];
  const selected = topics.filter(t => course === 'all' || String(t.course_id) === course);
  const filtered = selected.filter(FILTERS.find(f => f.id === filter).match)
    .sort((a, b) => rank(a) - rank(b) || a.avg_score - b.avg_score);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  const start = currentPage * PAGE_SIZE;

  return <div className="topic-results">
    <div className="topic-results-toolbar">
      <p>Tỷ lệ câu đúng theo từng chủ đề</p>
      <label>Khóa học
        <select value={course} onChange={e => { setCourse(e.target.value); setPage(0); }}>
          <option value="all">Tất cả khóa học</option>
          {courses.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </label>
    </div>
    <div className="topic-results-filters" role="group" aria-label="Lọc mức kết quả">
      {FILTERS.map(f => <button type="button" key={f.id} aria-pressed={filter === f.id}
        onClick={() => { setFilter(f.id); setPage(0); }}>
        {f.label} <span>{selected.filter(f.match).length}</span>
      </button>)}
    </div>
    <div className="topic-results-list">
      {filtered.slice(start, start + PAGE_SIZE).map(t => <div className="topic-results-item" key={`${t.course_id}-${t.topic_id || t.topic}`}>
        <span className="topic-results-course">{t.course_title || 'Khóa học'}</span>
        <TopicScoreBar topic={t.topic} avgScore={t.avg_score} status={t.status} answered={t.answered} correct={t.correct} />
      </div>)}
      {filtered.length === 0 && <p className="pg-muted">Không có chủ đề thuộc nhóm này.</p>}
    </div>
    <div className="topic-results-footer">
      <span role="status">{filtered.length ? `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} / ${filtered.length} chủ đề` : '0 chủ đề'}</span>
      {filtered.length > PAGE_SIZE && <div className="topic-results-pages">
        <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Trang chủ đề trước">← Trước</button>
        <button type="button" disabled={start + PAGE_SIZE >= filtered.length} onClick={() => setPage(currentPage + 1)} aria-label="Trang chủ đề sau">Sau →</button>
      </div>}
    </div>
    <details className="topic-results-help">
      <summary>Cách tính kết quả</summary>
      <p>Thống kê theo nhãn chủ đề câu hỏi, khác phân nhóm chương/bài ở gợi ý ôn tập. Tỷ lệ đúng không phải phần trăm hoàn thành bài học.</p>
      <p>Dùng lượt gần nhất của mỗi bài kiểm tra và bộ ôn tập. Cần ít nhất 5 câu khác nhau để phân loại; dưới 70% câu đúng thì cần củng cố. Mục chưa đủ dữ liệu chỉ phản ánh kết quả quan sát, chưa kết luận mức kiến thức. Các ngưỡng là quy tắc ban đầu của hệ thống.</p>
    </details>
  </div>;
}
