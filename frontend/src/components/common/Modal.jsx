/**
 * Wrapper hành vi dùng chung cho mọi modal CRUD (đóng khi click ra ngoài / nút đóng).
 * Không áp class mặc định cứng để từng trang có thể tái dùng đúng style gốc của trang đó.
 */
export default function Modal({ open, onClose, children, overlayClassName }) {
  // Đóng thì không render gì; click vào vùng nền tối bên ngoài nội dung sẽ gọi onClose
  if (!open) return null;

  return (
    <div
      className={
        overlayClassName ||
        'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-4 md:p-10'
      }
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* items-start (không items-center): căn giữa dọc trên khung flex có overflow-y:auto
          là lỗi CSS kinh điển — khi nội dung cao hơn khung nhìn, phần bị đẩy lên trên không
          cuộn tới được. Căn từ trên xuống thì luôn cuộn được hết nội dung, mọi kích thước màn hình. */}
      <div
        className="flex min-h-full items-start justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {children}
      </div>
    </div>
  );
}

