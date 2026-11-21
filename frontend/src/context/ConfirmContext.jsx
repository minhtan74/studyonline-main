import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import './ConfirmContext.css';

export const ConfirmContext = createContext(null);

const DEFAULTS = { title: 'Xác nhận', confirmLabel: 'Đồng ý', cancelLabel: 'Hủy', tone: 'default' };

// Hộp thoại xác nhận dùng chung, thay cho window.confirm() (xấu, không style được).
// confirm(message, { title, confirmLabel, cancelLabel, tone: 'default'|'danger' }) -> Promise<boolean>
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);
  const confirmBtnRef = useRef(null);

  const confirm = useCallback((message, options = {}) => new Promise((resolve) => {
    resolver.current = resolve;
    setState({ ...DEFAULTS, ...options, message });
  }), []);

  const finish = useCallback((result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  }, []);

  // Focus vào nút xác nhận khi mở; phím Esc = hủy
  useEffect(() => {
    if (!state) return undefined;
    confirmBtnRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') finish(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, finish]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="app-confirm-overlay" onClick={(e) => { if (e.target === e.currentTarget) finish(false); }}>
          <div
            className={`app-confirm-card app-confirm-${state.tone}`}
            role="alertdialog" aria-modal="true"
            aria-labelledby="app-confirm-title" aria-describedby="app-confirm-message"
          >
            <div className="app-confirm-icon" aria-hidden="true">{state.tone === 'danger' ? '⚠️' : '❓'}</div>
            <h2 id="app-confirm-title" className="app-confirm-title">{state.title}</h2>
            <p id="app-confirm-message" className="app-confirm-message">{state.message}</p>
            <div className="app-confirm-actions">
              <button type="button" className="app-confirm-btn app-confirm-cancel" onClick={() => finish(false)}>
                {state.cancelLabel}
              </button>
              <button
                type="button" ref={confirmBtnRef} onClick={() => finish(true)}
                className={`app-confirm-btn app-confirm-ok app-confirm-ok-${state.tone}`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
