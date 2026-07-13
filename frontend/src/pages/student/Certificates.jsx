import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/common/Modal.jsx';
import '../../assets/css/certificates.css';

// Dữ liệu hoàn toàn hardcoded, không gọi API — giữ nguyên như bản gốc (_legacy/pages/student/certificates.html)
const MOCK_CERTS = [
  { course: 'Web Design Basics', date: '15/03/2026', code: 'CERT-WD-001-2026', score: 95 },
  { course: 'JavaScript ES6+', date: '02/05/2026', code: 'CERT-JS-042-2026', score: 88 },
];

function CertPreview({ userName, cert }) {
  return (
    <div className="cert-preview">
      <div className="cert-logo">🎓</div>
      <div className="cert-brand">StudyOnline — Certificate of Completion</div>
      <div className="cert-title-text">Chứng nhận hoàn thành khóa học</div>
      <div className="cert-name">{userName}</div>
      <div className="cert-course">{cert.course}</div>
      <hr className="cert-divider" />
      <div className="cert-meta">
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cert.score}%</div>
          <div>Điểm đạt</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cert.date}</div>
          <div>Ngày cấp</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{cert.code}</div>
          <div>Mã chứng chỉ</div>
        </div>
      </div>
      <div className="cert-qr">📱</div>
      <div style={{ fontSize: '.75rem', opacity: 0.5, marginTop: '.75rem', position: 'relative', zIndex: 1 }}>
        Quét QR để xác thực • studyonline.edu.vn/verify
      </div>
    </div>
  );
}

/** Tương đương _legacy/pages/student/certificates.html — MOCK_CERTS hoàn toàn tĩnh, không gọi API */
export default function Certificates() {
  const { user } = useAuth();
  const userName = user?.fullname || 'Học viên';
  const [modalCert, setModalCert] = useState(null);

  function handleDownloadStub() {
    window.alert('Tính năng tải PDF đang phát triển!');
  }

  return (
    <main className="s-main">
      <div className="s-page-title">🏆 Chứng chỉ của tôi</div>
      <div className="s-page-subtitle">Các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học</div>

      <Modal open={modalCert !== null} onClose={() => setModalCert(null)} overlayClassName="cert-modal-overlay">
        <div className="cert-modal-box" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800 }}>🏆 Xem chứng chỉ</h3>
            <button onClick={() => setModalCert(null)} className="s-btn s-btn-ghost s-btn-sm">
              ✕ Đóng
            </button>
          </div>
          <div id="certPreviewWrap">{modalCert && <CertPreview userName={userName} cert={modalCert} />}</div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <button className="s-btn s-btn-outline" onClick={() => window.print()}>
              🖨 In
            </button>
            <button className="s-btn s-btn-primary" onClick={handleDownloadStub}>
              ⬇ Tải PDF
            </button>
          </div>
        </div>
      </Modal>

      <div className="cert-list" id="certList">
        {MOCK_CERTS.length === 0 && (
          <div className="s-empty" style={{ gridColumn: '1/-1' }}>
            <div className="icon">🏆</div>
            <h3>Chưa có chứng chỉ nào</h3>
            <p>Hoàn thành khóa học để nhận chứng chỉ!</p>
            <Link to="/student/courses" className="s-btn s-btn-primary" style={{ marginTop: '1rem' }}>
              Xem khóa học
            </Link>
          </div>
        )}

        {MOCK_CERTS.map((cert, i) => (
          <div key={i} className="s-card" style={{ overflow: 'hidden' }}>
            <div
              style={{
                background: 'linear-gradient(135deg,#1e3a5f,#0F172A)',
                padding: '1.5rem',
                textAlign: 'center',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  background: 'rgba(37,99,235,.2)',
                  borderRadius: '50%',
                }}
              ></div>
              <div style={{ fontSize: '2rem', marginBottom: '.5rem', position: 'relative', zIndex: 1 }}>🏆</div>
              <div style={{ fontSize: '.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '.08em', position: 'relative', zIndex: 1 }}>
                Certificate of Completion
              </div>
              <div style={{ fontSize: '.95rem', fontWeight: 700, margin: '.4rem 0', color: '#93C5FD', position: 'relative', zIndex: 1 }}>
                {cert.course}
              </div>
              <div style={{ fontSize: '.8rem', opacity: 0.7, position: 'relative', zIndex: 1 }}>{userName}</div>
            </div>
            <div className="s-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--s-text-muted)' }}>📅 Ngày cấp</span>
                  <span style={{ fontWeight: 600 }}>{cert.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--s-text-muted)' }}>🔑 Mã chứng chỉ</span>
                  <span style={{ fontWeight: 600, fontSize: '.8rem' }}>{cert.code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--s-text-muted)' }}>🎯 Điểm đạt</span>
                  <span className="s-badge s-badge-green">{cert.score}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <button className="s-btn s-btn-outline" style={{ flex: 1 }} onClick={() => setModalCert(cert)}>
                  👁 Xem
                </button>
                <button className="s-btn s-btn-primary" style={{ flex: 1 }} onClick={handleDownloadStub}>
                  ⬇ Tải PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
