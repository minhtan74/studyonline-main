import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function markdownUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, 'https://studyonline.invalid');
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? value : '';
  } catch { return ''; }
}

function CodeBlock({ children }) {
  const [notice, setNotice] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const code = children?.props;
  const language = /language-([\w+-]+)/.exec(code?.className || '')?.[1] || 'code';
  const text = typeof code?.children === 'string' ? code.children : '';
  async function copy() {
    try { await navigator.clipboard.writeText(text); setNotice('Đã sao chép'); }
    catch { setNotice('Không sao chép được'); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(''), 2500);
  }
  return <div className="ai-code-block">
    <div className="ai-code-toolbar"><span>{language}</span><button type="button" onClick={copy} aria-label="Sao chép mã">{notice || 'Sao chép'}</button></div>
    <pre tabIndex={0} aria-label={`Mã ${language}`}>{children}</pre>
    <span className="ai-copy-status" role="status">{notice}</span>
  </div>;
}

const components = {
  pre: CodeBlock,
  a: ({ href, children }) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
  img: ({ alt }) => <span className="ai-image-description">{alt || 'Ảnh minh họa'}</span>,
  table: ({ children }) => <div className="ai-table-scroll" tabIndex={0} role="region" aria-label="Bảng trong câu trả lời"><table>{children}</table></div>,
};

export default function AiMarkdownRenderer({ content }) {
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={markdownUrl} components={components}>
    {typeof content === 'string' ? content : ''}
  </Markdown>;
}
