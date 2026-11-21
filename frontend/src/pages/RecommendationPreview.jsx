import { useState } from 'react';
import '../assets/css/recommendation-preview.css';

const courses = [
  { id: 'python', name: 'Lập trình Python', icon: 'Py', description: 'Kiểm tra toàn khóa · Lượt nộp minh họa', guidance: 'Ưu tiên ôn Vòng lặp trước, sau đó đến Hàm. Khi luyện, hãy viết ra giá trị biến qua từng bước trước khi chọn đáp án.', chapters: [
    { name: 'Chương 2 · Cấu trúc điều khiển', correct: 8, total: 20, lessons: [
      { name: 'Vòng lặp', correct: 3, total: 10, topic: 'Điều kiện dừng và cập nhật biến', advice: 'Hai câu sai minh họa có đáp án được chọn khiến vòng lặp chạy thêm một lần. Có dấu hiệu nhầm thời điểm kiểm tra điều kiện. Hãy mô phỏng từng vòng bằng bảng giá trị biến.', plan: ['Đọc lại điều kiện dừng của while.', 'Lập bảng giá trị biến cho một ví dụ trong bài.', 'Làm bài luyện và kiểm tra lại điều kiện trước mỗi vòng.'] },
      { name: 'Rẽ nhánh', correct: 5, total: 10, topic: 'Thứ tự kiểm tra if / elif', advice: 'Hãy kiểm tra từng nhánh theo thứ tự và chú ý trường hợp nhiều điều kiện cùng đúng.', plan: ['Ôn thứ tự thực hiện các nhánh.', 'Thử các giá trị tại biên của điều kiện.', 'Luyện bài rẽ nhánh trước khi kết hợp vòng lặp.'] },
    ] },
    { name: 'Chương 3 · Hàm', correct: 3, total: 7, lessons: [
      { name: 'Tham số và giá trị trả về', correct: 2, total: 5, topic: 'Phân biệt return và print', advice: 'Nên theo dõi riêng giá trị hàm trả về và nội dung được in ra màn hình.', plan: ['Xem ví dụ về return.', 'Dự đoán kết quả trước khi chạy mã.', 'Làm bộ luyện về hàm.'] },
      { name: 'Phạm vi biến', correct: 1, total: 2, topic: 'Cần bổ sung câu trả lời', advice: 'Mới có hai câu làm căn cứ. Hãy luyện thêm; chưa đủ dữ liệu để kết luận về phần kiến thức này.', plan: ['Xem lại ví dụ biến cục bộ.', 'Làm thêm câu hỏi khác nhau về phạm vi biến.'] },
    ] },
  ] },
  { id: 'sql', name: 'Cơ sở dữ liệu', icon: 'SQL', description: 'Kiểm tra chương · Lượt nộp minh họa', guidance: 'Tập trung vào cách ghép các bảng. Hãy vẽ bảng kết quả trung gian để kiểm tra những dòng được giữ lại khi JOIN.', chapters: [
    { name: 'Chương 4 · Truy vấn SQL', correct: 2, total: 5, lessons: [
      { name: 'Kết nối bảng với JOIN', correct: 2, total: 5, topic: 'INNER JOIN và LEFT JOIN', advice: 'Các câu sai minh họa liên quan đến dòng không có bản ghi khớp. Hãy đối chiếu cách INNER JOIN và LEFT JOIN xử lý dòng đó.', plan: ['Đọc ví dụ INNER JOIN và LEFT JOIN.', 'Tự ghép hai bảng nhỏ trên giấy.', 'Làm bài luyện với các dòng không khớp.'] },
    ] },
  ] },
  { id: 'network', name: 'Mạng máy tính', icon: 'NET', description: 'Chưa có kết quả kiểm tra', chapters: [] },
];

function LessonCard({ lesson, onAction }) {
  const enough = lesson.total >= 5;
  return <article className="rp-lesson">
    <div className="rp-lesson-heading"><h4>{lesson.name}</h4><span className={`rp-badge ${enough ? 'rp-review' : 'rp-check'}`}>{enough ? 'Nên ôn tập' : 'Cần kiểm tra thêm'}</span></div>
    <p className="rp-score">Đúng <strong>{lesson.correct}/{lesson.total} câu</strong>{enough ? ` · ${Math.round(lesson.correct / lesson.total * 100)}%` : ' · Chưa đủ 5 câu khác nhau'}</p>
    <p><strong>{enough ? 'Cần chú ý: ' : ''}</strong>{lesson.topic}</p>
    <div className="rp-ai-note"><span className="rp-ai-label">✧ AI hướng dẫn · Minh họa</span><p>{lesson.advice}</p>
      <details><summary>Cách ôn từng bước</summary><ol>{lesson.plan.map(step => <li key={step}>{step}</li>)}</ol></details>
    </div>
    <div className="rp-actions"><button onClick={() => onAction(`Ôn bài: ${lesson.name}`)}>Ôn bài học <span aria-hidden="true">↗</span></button><button className="rp-secondary" onClick={() => onAction(`Luyện bài: ${lesson.name}`)}>Luyện bài</button></div>
    <details className="rp-evidence"><summary>Vì sao có gợi ý này?</summary><p>Dữ liệu minh họa: đúng {lesson.correct}/{lesson.total} nội dung câu hỏi khác nhau. {enough ? 'Đã đủ 5 câu và tỷ lệ đúng dưới 70% nên đề xuất ôn tập.' : 'Có câu sai nhưng chưa đủ 5 câu; chỉ khuyến khích kiểm tra thêm.'} Lời hướng dẫn AI phía trên được soạn sẵn để xem thử giao diện.</p></details>
  </article>;
}

export default function RecommendationPreview({ embedded = false }) {
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('all');
  const [notice, setNotice] = useState('');
  const [empty, setEmpty] = useState(false);
  const visible = courses.filter(c => filter === 'all' || filter === c.id);
  const lessons = visible.flatMap(c => c.chapters.flatMap(ch => ch.lessons));
  const Container = embedded ? 'section' : 'main';
  return <Container className={`rp-page${embedded ? ' rp-embedded' : ''}`} aria-label="Xem thử gợi ý ôn tập AI">
    {!embedded && <header className="rp-nav"><a href="/">Study<span>Online</span></a><span>Bản xem thử giao diện</span></header>}
    <div className="rp-container">
      <div className="rp-demo"><strong>Dữ liệu minh họa</strong><span>Nhận xét AI được soạn sẵn để xem thử. Không sử dụng hoặc lưu kết quả học viên.</span></div>
      <header className="rp-heading"><div><span className="rp-eyebrow">LỘ TRÌNH HỌC TẬP</span><h1>Ôn đúng phần, học vững hơn.</h1><p>Xem nội dung cần củng cố và hướng dẫn ôn riêng cho từng khóa học.</p></div><button className="rp-empty-toggle" aria-pressed={empty} onClick={() => setEmpty(!empty)}>{empty ? 'Xem dữ liệu minh họa' : 'Xem khi chưa có kết quả'}</button></header>
      <section className="rp-stats" aria-label="Tóm tắt"><div><strong>{visible.length}</strong><span>Khóa học</span></div><div><strong>{empty ? 0 : lessons.filter(l => l.total >= 5).length}</strong><span>Bài nên ôn tập</span></div><div><strong>{empty ? 0 : lessons.filter(l => l.total < 5).length}</strong><span>Bài cần kiểm tra thêm</span></div></section>
      <div className="rp-toolbar"><label>Khóa học <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả khóa học</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="rp-tabs" aria-label="Lọc nội dung">{[['all','Tất cả'],['review','Nên ôn tập'],['check','Cần kiểm tra thêm']].map(([value,label]) => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{label}</button>)}</div></div>
      <div className="rp-courses">{visible.map(course => {
        const chapters = empty ? [] : course.chapters.map(ch => ({ ...ch, lessons: ch.lessons.filter(l => mode === 'all' || (mode === 'review' ? l.total >= 5 : l.total < 5)) })).filter(ch => ch.lessons.length);
        return <section className="rp-course" key={course.id}><header className="rp-course-header"><span className="rp-course-icon">{course.icon}</span><div><h2>{course.name}</h2><p>{empty ? 'Chưa có kết quả kiểm tra' : course.description}</p></div><span className="rp-course-count">{chapters.reduce((sum,ch) => sum + ch.lessons.length,0)} bài được gợi ý</span></header>
          {chapters.length ? <><div className="rp-course-guidance"><span className="rp-ai-label">✧ Hướng dẫn ôn trong khóa · Minh họa</span><p>{course.guidance}</p></div>{chapters.map((ch,i) => <details className="rp-chapter" key={`${course.id}-${ch.name}-${mode}`} open={i === 0}><summary><span className="rp-caret">›</span><span>{ch.name}<small>Đúng {ch.correct}/{ch.total} câu của chương · Dữ liệu minh họa</small></span><span className="rp-chapter-count">{ch.lessons.length} bài</span></summary><div className="rp-lessons">{ch.lessons.map(l => <LessonCard key={l.name} lesson={l} onAction={setNotice} />)}</div><button className="rp-chapter-practice" onClick={() => setNotice(`Luyện cả ${ch.name}`)}>Luyện cả chương →</button></details>)}</> : <div className="rp-empty"><span aria-hidden="true">◎</span><h3>{empty || !course.chapters.length ? 'Chưa đủ dữ liệu để gợi ý ôn tập' : 'Không có bài thuộc nhóm đã chọn'}</h3><p>{empty || !course.chapters.length ? 'Làm bài kiểm tra để nhận gợi ý theo chương, bài và chủ đề. Tiến độ học vẫn được giữ riêng.' : 'Đổi bộ lọc để xem các nội dung khác trong khóa.'}</p>{(empty || !course.chapters.length) && <button onClick={() => setNotice(`Chọn bài kiểm tra: ${course.name}`)}>Chọn bài kiểm tra →</button>}</div>}
        </section>;
      })}</div>
      <p className="rp-footnote">Căn cứ phân loại: ít nhất 5 câu khác nhau · Dưới 70% đề xuất ôn tập. Mỗi khóa được đánh giá riêng.</p>
    </div>
    {notice && <div className="rp-modal-backdrop" onClick={() => setNotice('')}><section className="rp-modal" role="dialog" aria-modal="true" aria-labelledby="rp-dialog-title"><h2 id="rp-dialog-title">{notice}</h2><p>Đây là thao tác minh họa. Khi nối dữ liệu thật, nút này sẽ mở đúng bài học hoặc bộ luyện của khóa tương ứng.</p><button autoFocus onClick={() => setNotice('')}>Đóng bản xem thử</button></section></div>}
  </Container>;
}
