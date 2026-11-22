import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';

function fmtMoney(n) {
  return Number(n || 0).toLocaleString('vi-VN') + 'đ';
}

/**
 * Trang thanh toán GIẢ LẬP — chỉ dùng để demo khi cổng VNPay sandbox không dùng được.
 * Backend chỉ tạo đơn "SIM..." khi bật PAYMENT_SIMULATOR; trang này đọc lại đơn thật từ API,
 * rồi gửi kết quả (thành công / hủy) về backend để xử lý như một giao dịch bình thường.
 */
export default function PaymentSimulator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ref = params.get('ref') || '';
  const [state, setState] = useState({ loading: true, payment: null, error: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Tải thông tin đơn: chỉ chấp nhận đơn giả lập (mã SIM...) còn đang chờ thanh toán
  useEffect(() => {
    let active = true;
    (async () => {
      if (!ref.startsWith('SIM')) {
        if (active) setState({ loading: false, payment: null, error: 'Đơn hàng này không phải đơn thanh toán giả lập.' });
        return;
      }
      const res = await paymentService.getStatus(ref);
      if (!active) return;
      const data = res?.data?.data;
      if (res?.data?.success && data && data.transaction_ref === ref) {
        const error = data.status === 'pending' ? '' : 'Đơn hàng này đã được xử lý, không thể thanh toán lại.';
        setState({ loading: false, payment: data, error });
      } else {
        setState({ loading: false, payment: null, error: res?.data?.message || 'Không tìm thấy đơn hàng.' });
      }
    })();
    return () => { active = false; };
  }, [ref]);

  // Gửi kết quả về backend rồi chuyển sang trang kết quả thanh toán chung
  async function finish(result) {
    setBusy(true);
    setMessage('');
    const res = await paymentService.confirmSimulated(ref, result);
    if (res?.data?.success) {
      navigate(`/student/payment-result?ref=${encodeURIComponent(ref)}`, { replace: true });
      return;
    }
    setBusy(false);
    setMessage(res?.data?.message || 'Không thể ghi nhận kết quả. Vui lòng thử lại.');
  }

  const { loading, payment, error } = state;
  if (loading) {
    return (
      <main className="s-main" style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--s-text-muted)' }}>
        <p role="status">⏳ Đang tải đơn hàng...</p>
      </main>
    );
  }

  return (
    <main className="s-main">
      <div
        style={{
          maxWidth: 520,
          margin: '2rem auto',
          background: 'var(--s-surface, #fff)',
          border: '2px dashed #f59e0b',
          borderRadius: 16,
          padding: '2rem 1.75rem',
          textAlign: 'center',
        }}
      >
        {/* Cảnh báo rõ ràng để không ai nhầm đây là giao dịch thật */}
        <div role="note" style={{ background: '#fffbeb', color: '#92400e', borderRadius: 10, padding: '0.6rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>
          ⚠️ CHẾ ĐỘ GIẢ LẬP — KHÔNG PHẢI GIAO DỊCH THẬT
        </div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '1.1rem 0 0.4rem' }}>Cổng thanh toán giả lập</h1>

        {error ? (
          <p role="alert" style={{ color: 'var(--s-text-muted)', fontSize: '0.9rem', margin: '1rem 0' }}>{error}</p>
        ) : (
          <>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '0.88rem' }}>
              Trang này thay cho cổng VNPay để minh họa luồng mua khóa học. Không có tiền thật được chuyển.
            </p>
            <div style={{ textAlign: 'left', background: 'var(--s-surface-2)', borderRadius: 10, padding: '1rem 1.1rem', margin: '1.25rem 0', fontSize: '0.86rem' }}>
              {[
                ['Khóa học', payment.course_title],
                ['Số tiền', fmtMoney(payment.amount)],
                ['Mã đơn hàng', payment.transaction_ref],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.3rem 0' }}>
                  <span style={{ color: 'var(--s-text-muted)' }}>{k}</span>
                  <strong style={{ textAlign: 'right', wordBreak: 'break-word' }}>{v}</strong>
                </div>
              ))}
            </div>
            {message && <p role="alert" style={{ color: 'var(--s-danger, #dc2626)', fontSize: '0.86rem' }}>{message}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="s-btn s-btn-primary" disabled={busy} onClick={() => finish('success')}>
                ✅ Thanh toán thành công
              </button>
              <button type="button" className="s-btn s-btn-ghost" disabled={busy} onClick={() => finish('failed')}>
                ❌ Hủy / thất bại
              </button>
            </div>
          </>
        )}
        {error && (
          <button type="button" className="s-btn s-btn-ghost" onClick={() => navigate('/student/courses', { replace: true })}>
            Xem khóa học
          </button>
        )}
      </div>
    </main>
  );
}
