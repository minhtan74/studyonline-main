import { createContext, useCallback, useRef, useState } from 'react';

export const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type, show: false }]);

    // enter animation, tương đương setTimeout(10ms) của bản gốc
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, show: true } : t)));
    }, 10);

    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, show: false } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 350);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toastContainer" className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item${t.show ? ' toast-show' : ''}`}
            style={{
              borderLeft: `4px solid ${
                t.type === 'error' ? '#EF4444' : t.type === 'info' ? '#2563EB' : '#10B981'
              }`,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
