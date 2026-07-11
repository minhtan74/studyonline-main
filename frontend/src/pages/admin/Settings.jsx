import { Link } from 'react-router-dom';

/**
 * Tương đương #placeholderView (viewName = 'settings') trong _legacy/pages/admin/dashboard.html.
 * Bản gốc không có chức năng thật, chỉ hiển thị placeholder "đang phát triển" — giữ nguyên verbatim.
 */
export default function AdminSettings() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/admin">Admin</Link> / <span>SETTINGS</span>
        </div>
        <h1 className="page-title">Thiết lập settings</h1>
        <p className="page-subtitle">Chức năng điều khiển hệ thống nâng cao.</p>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
        <h2>Tính năng đang phát triển</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Trang cấu hình này đang được thiết lập hệ thống.
        </p>
        <Link to="/admin" className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Quay lại Dashboard
        </Link>
      </div>
    </>
  );
}
