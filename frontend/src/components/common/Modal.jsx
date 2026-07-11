/**
 * Wrapper hành vi dùng chung cho mọi modal CRUD (đóng khi click ra ngoài / nút đóng).
 * Không áp class mặc định cứng để từng trang có thể tái dùng đúng style gốc của trang đó.
 */
export default function Modal({ open, onClose, children, overlayClassName }) {
  if (!open) return null;

  return (
    <div
      className={
        overlayClassName ||
        'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
