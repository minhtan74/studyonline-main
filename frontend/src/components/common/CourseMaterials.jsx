import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';

export default function CourseMaterials({ courseId }) {
  const [state, setState] = useState({ loading: true, items: [] });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ loading: true, items: [] });
    courseService.getMaterials(courseId).then(res => {
      if (!active) return;
      setState({ loading: false, items: res?.data?.data || [],
        denied: res?.status === 403, error: !res?.ok && res?.status !== 403 });
    }).catch(() => { if (active) setState({ loading: false, items: [], error: true }); });
    return () => { active = false; };
  }, [courseId, retry]);
  return <section className="s-card course-materials" aria-label="Tài liệu toàn khóa">
    <div className="s-card-header"><h2 className="s-card-title">📚 Tài liệu & thực hành toàn khóa</h2></div>
    <div className="s-card-body">
      {state.loading ? <p role="status">Đang tải tài liệu…</p>
        : state.denied ? <p>Đăng ký khóa học để đọc sổ tay và tài liệu toàn khóa.</p>
          : state.error ? <div role="alert">Chưa tải được tài liệu. <button type="button" className="s-btn s-btn-ghost s-btn-sm" onClick={() => setRetry(n => n + 1)}>Thử lại</button></div>
            : state.items.length ? <>
              <p className="course-materials-note">Bắt đầu với sổ tay để xem lộ trình, cách học và yêu cầu dự án cuối khóa. Tài liệu từng bài nằm trong đề cương bên dưới.</p>
              <details open={state.items.length <= 3}>
                <summary>{state.items.length} tài liệu toàn khóa</summary>
                <ul>{state.items.map(doc => <li key={doc.id}>
                  <Link to={`/ai-source?document_id=${doc.id}`}><span>📄 {doc.title}</span><small>{doc.file_type.toUpperCase()}{doc.pages ? ` · ${doc.pages} trang` : ''} · Mở tài liệu →</small></Link>
                </li>)}</ul>
              </details>
            </> : <p>Tài liệu học tập được đính kèm trong từng bài bên dưới.</p>}
    </div>
  </section>;
}
