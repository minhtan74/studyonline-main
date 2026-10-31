import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { aiService } from '../services/aiService';

export default function AiSource() {
  const [params] = useSearchParams();
  const id = Number(params.get('document_id'));
  const requestedPage = Number(params.get('page'));
  const validId = Number.isSafeInteger(id) && id > 0;
  const [retry, setRetry] = useState(0);
  const [resource, setResource] = useState(null);
  useEffect(() => {
    let active = true, objectUrl;
    const controller = new AbortController();
    setResource(null);
    if (!validId) { setResource({ id, error: 'Liên kết nguồn không hợp lệ.' }); return () => { active = false; }; }
    (async () => {
      try {
        const meta = await aiService.documentSource(id, controller.signal);
        if (!active) return;
        if (!meta.ok) { setResource({ id, error: meta.data?.message || 'Không thể mở tài liệu nguồn.' }); return; }
        const file = await aiService.documentContent(id, controller.signal);
        if (!active) return;
        if (!file.ok) { setResource({ id, error: file.data?.message || 'Không thể tải tài liệu nguồn.' }); return; }
        objectUrl = URL.createObjectURL(file.data);
        if (meta.data.data.file_type === 'txt') {
          const text = await file.data.text();
          if (active) setResource({ id, meta: meta.data.data, text, url: objectUrl });
        } else {
          setResource({ id, meta: meta.data.data, url: objectUrl });
        }
      } catch {
        if (active) setResource({ id, error: 'Không thể kết nối để tải tài liệu nguồn. Vui lòng thử lại.' });
      }
    })();
    return () => { active = false; controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, validId, retry]);
  const loading = !resource || !Object.is(resource.id, id);
  const meta = resource?.meta;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, meta?.pages > 0 ? meta.pages : requestedPage) : 1;
  return <main className="s-main" style={{ minWidth: 0 }}>
    <h1 className="s-page-title">Tài liệu nguồn AI</h1>
    {loading ? <p role="status">Đang kiểm tra quyền và tải tài liệu…</p> : resource.error ? <div role="alert" className="s-card" style={{ padding: 20 }}>
      <p>{resource.error}</p><button className="s-btn s-btn-primary" style={{ marginTop: 12 }} onClick={() => setRetry(n => n + 1)}>Thử lại</button>
    </div> : <>
      <h2 style={{ fontSize: '1.1rem', overflowWrap: 'anywhere', marginBottom: 12 }}>{meta.title || meta.filename}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {meta.file_type === 'pdf' && <span>Trang {page}{meta.pages ? ` / ${meta.pages}` : ''}</span>}
        <Link className="s-btn s-btn-ghost" to={meta.lesson_id ? `/lesson?id=${meta.lesson_id}` : `/chapters?course_id=${meta.course_id}`}>{meta.lesson_id ? 'Về bài học' : 'Về khóa học'}</Link>
        {resource.url && <a className="s-btn s-btn-primary" href={resource.url} download={meta.filename}>Tải tài liệu</a>}
      </div>
      {meta.file_type === 'pdf' ? <>
        <iframe src={`${resource.url}#page=${page}`} title={`Tài liệu: ${meta.title || meta.filename}`} style={{ display: 'block', width: '100%', height: '75vh', border: '1px solid var(--s-border)', borderRadius: 10, background: '#fff' }} />
        <p style={{ fontSize: '.85rem', marginTop: 10 }}>Nếu trình duyệt không hiển thị PDF, hãy tải tài liệu và mở trang {page}.</p>
      </> : meta.file_type === 'txt' ? <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 20, background: '#fff', borderRadius: 10 }}>{resource.text}</pre>
        : <p>Định dạng Word cần được tải xuống để mở bằng ứng dụng đọc tài liệu.</p>}
    </>}
  </main>;
}
