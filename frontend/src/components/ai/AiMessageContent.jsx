import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/ai-markdown.css';

let cachedRenderer;
let loadingRenderer;
function loadRenderer() {
  if (cachedRenderer) return Promise.resolve(cachedRenderer);
  if (!loadingRenderer) loadingRenderer = import('./AiMarkdownRenderer.jsx').then(module => {
    cachedRenderer = module.default;
    return cachedRenderer;
  }).catch(error => { loadingRenderer = null; throw error; });
  return loadingRenderer;
}

export default function AiMessageContent({ content }) {
  const [Renderer, setRenderer] = useState(() => cachedRenderer || null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setFailed(false);
    loadRenderer().then(component => { if (active) setRenderer(() => component); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <div className="ai-markdown">
    {Renderer ? <Renderer content={content} /> : <>
      <div style={{ whiteSpace: 'pre-wrap' }}>{typeof content === 'string' ? content : ''}</div>
      {failed && <div style={{ marginTop: 8, fontSize: '.8rem' }}>
        <p>Chưa tải được định dạng. Bạn có thể tải lại trang rồi mở lại hội thoại.</p>
        <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>
      </div>}
    </>}
  </div>;
}

export function AiSources({ sources }) {
  if (!Array.isArray(sources) || !sources.length) return null;
  return <nav className="ai-source-list" aria-label="Nguồn trích dẫn">
    {sources.filter(source => source && typeof source === 'object').map((source, index) => {
      const id = Number(source.document_id);
      const validId = Number.isSafeInteger(id) && id > 0;
      const page = Number(source.page);
      const validPage = Number.isSafeInteger(page) && page > 0;
      const title = typeof source.document === 'string' && source.document.trim() ? source.document : 'Tài liệu nguồn';
      const label = `📄 ${title}${validPage ? ` — tr. ${page}` : ''}`;
      return validId ? <Link key={index} className="ai-source-link" to={`/ai-source?document_id=${id}${validPage ? `&page=${page}` : ''}`} target="_blank" rel="noopener noreferrer" title="Mở tài liệu nguồn trong tab mới">{label}</Link>
        : <span key={index} className="ai-source-link ai-source-unavailable" title="Nguồn cũ chưa có mã tài liệu để mở">{label} · Chưa có liên kết</span>;
    })}
  </nav>;
}
