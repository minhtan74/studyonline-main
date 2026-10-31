import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../hooks/useToast';
import '../../assets/css/student-courses.css';

// Biểu tượng và màu nền trang trí thẻ khóa học (chọn theo id khóa)
const EMOJIS = ['🎨', '💻', '📊', '🔬', '🌐', '📱', '🎵', '✏️', '🧪', '📐', '🚀', '🔐'];
const COLORS = [
  '#2563EB,#8B5CF6',
  '#0F766E,#06B6D4',
  '#7C3AED,#EC4899',
  '#DC2626,#F59E0B',
  '#059669,#2563EB',
  '#D97706,#EF4444',
  '#1D4ED8,#06B6D4',
  '#7C3AED,#2563EB',
];
// Trình độ dùng cho nhãn hiển thị
const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
const LEVEL_DB = ['beginner', 'intermediate', 'advanced'];
const LEVEL_CLS = ['level-begin', 'level-mid', 'level-adv'];

// Use actual published lesson/document counts supplied by the course API.
function courseMeta(c) {
  const lessons = Number(c.lesson_count) || 0;
  const documents = Number(c.document_count) || 0;
  const lvlIdx = LEVEL_DB.indexOf(c.level);
  return { lessons, documents, lvlIdx };
}

// Hiển thị giá: 0 -> "Miễn phí", còn lại dạng 499.000đ
function fmtPrice(p) {
  if (!p || p <= 0) return <span className="price-free">🆓 Miễn phí</span>;
  return <span className="price-paid">{Number(p).toLocaleString('vi-VN')}đ</span>;
}

// A failed request stays unknown; it must not be interpreted as an empty list.
function useDiscoveryList(request, transform) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    (async () => {
      try {
        const response = await request();
        const rows = response?.data?.data;
        if (!response?.ok || response.data?.success !== true || !Array.isArray(rows)) throw new Error('Unavailable list');
        if (active) setData(transform(rows));
      } catch {
        if (active) { setData(null); setError(true); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [request, transform, version]);
  return { data, setData, loading, error, retry: () => setVersion(value => value + 1) };
}
const loadCatalog = () => courseService.getCourses();
const loadEnrollments = () => enrollmentService.getEnrolledIds();
const keepRows = rows => rows;
const normalizeEnrollmentIds = rows => {
  if (rows.some(id => !Number.isSafeInteger(Number(id)) || Number(id) <= 0)) throw new Error('Invalid enrollment IDs');
  return new Set(rows.map(Number));
};

/** Tương đương _legacy/pages/student/courses.html + _legacy/js/student-courses.js */
export default function Courses() {
  const { showToast } = useToast();

  const catalog = useDiscoveryList(loadCatalog, keepRows);
  const enrollments = useDiscoveryList(loadEnrollments, normalizeEnrollmentIds);
  const allCourses = catalog.data;
  const enrolledIds = enrollments.data;
  const setEnrolledIds = enrollments.setData;
  const loading = catalog.loading || enrollments.loading;
  const ready = !loading && !catalog.error && !enrollments.error && allCourses !== null && enrolledIds !== null;
  const [enrollingId, setEnrollingId] = useState(null);
  const enrollmentPending = useRef(false);

  // Bộ lọc: từ khóa tìm kiếm, cách sắp xếp
  const [searchVal, setSearchVal] = useState('');
  const [currentSort, setCurrentSort] = useState('newest');

  // Hộp thoại chi tiết khóa học và hộp thoại xác nhận thanh toán VNPay
  const [detailCourse, setDetailCourse] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [payError, setPayError] = useState(null);
  const [paying, setPaying] = useState(false);

  // Khóa cuộn trang nền khi đang mở hộp thoại
  useEffect(() => {
    document.body.style.overflow = detailCourse || paymentCourse ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [detailCourse, paymentCourse]);

  // Khóa chưa đăng ký: trang Khám phá chỉ hiện các khóa này (khóa đã đăng ký nằm ở "Khóa học của tôi")
  const available = useMemo(
    () => (allCourses && enrolledIds ? allCourses.filter((c) => !enrolledIds.has(Number(c.id))) : []),
    [allCourses, enrolledIds],
  );

  // Lọc theo từ khóa (tên hoặc mô tả), rồi sắp xếp theo lựa chọn (A-Z, Z-A, giá tăng/giảm)
  const filtered = useMemo(() => {
    const q = searchVal.toLowerCase();
    let list = available.filter(
      (c) => !q || (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q),
    );
    if (currentSort === 'az') list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (currentSort === 'za') list = [...list].sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    if (currentSort === 'price_asc') list = [...list].sort((a, b) => (+a.price || 0) - (+b.price || 0));
    if (currentSort === 'price_desc') list = [...list].sort((a, b) => (+b.price || 0) - (+a.price || 0));
    return list;
  }, [available, searchVal, currentSort]);

  // Mở / đóng hộp thoại chi tiết khóa học
  function openDetail(course) {
    setDetailCourse(course);
  }
  function closeDetail() {
    setDetailCourse(null);
  }

  // Mở / đóng hộp thoại xác nhận thanh toán
  function openPayment(course) {
    setPaymentCourse(course);
    setPayError(null);
    setPaying(false);
  }
  function closePayment() {
    if (!paying) setPaymentCourse(null);
  }

  // Bấm "Đăng ký": khóa có phí -> mở thanh toán; miễn phí -> ghi danh ngay
  function startEnroll(course) {
    if (!ready || enrolledIds.has(Number(course.id))) return;
    if (+course.price > 0) {
      openPayment(course);
    } else {
      doFreeEnroll(course.id);
    }
  }

  // Ghi danh khóa miễn phí
  async function doFreeEnroll(courseId) {
    if (enrollmentPending.current) return;
    enrollmentPending.current = true;
    setEnrollingId(Number(courseId));
    try {
      const res = await enrollmentService.enroll(courseId);
      if (res?.ok && res.data?.success) {
        setEnrolledIds((prev) => new Set(prev).add(Number(courseId)));
        showToast('Đã đăng ký khóa học. Bạn có thể bắt đầu học trong “Khóa học của tôi”.', 'success');
      } else {
        showToast(res?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
      }
    } catch {
      showToast('Không thể kết nối để đăng ký. Vui lòng thử lại.', 'error');
    } finally {
      enrollmentPending.current = false;
      setEnrollingId(null);
    }
  }

  // Thanh toán qua VNPay: backend tạo đơn hàng (pending) rồi trả URL -> chuyển học viên sang trang VNPay.
  // Sau khi thanh toán, VNPay đưa học viên về /student/payment-result để xem kết quả.
  async function doPayment() {
    setPayError(null);
    setPaying(true);
    const res = await paymentService.createVnpay(paymentCourse.id);

    if (res?.data?.success && res.data.payment_url) {
      window.location.href = res.data.payment_url;
      return; // giữ trạng thái "đang chuyển" cho tới khi trang VNPay mở
    }
    setPaying(false);
    // Trường hợp khóa đã chuyển thành miễn phí: backend ghi danh luôn
    if (res?.data?.success && res.data.enrolled) {
      setEnrolledIds((prev) => new Set(prev).add(Number(paymentCourse.id)));
      setPaymentCourse(null);
      showToast('Đã đăng ký khóa học. Bạn có thể bắt đầu học trong “Khóa học của tôi”.', 'success');
      return;
    }
    setPayError('❌ ' + (res?.data?.message || 'Không thể tạo đơn thanh toán. Vui lòng thử lại.'));
  }

  return (
    <main className="s-main">
      {/* Hero */}
      <div className="explore-hero">
        <h1>🌐 Khám phá khóa học</h1>
        <p>Tìm khóa học phù hợp, xem nội dung và đăng ký để bắt đầu học.</p>
        <div className="hero-search">
          <input
            type="search"
            aria-label="Tìm kiếm khóa học"
            id="heroSearch"
            placeholder="Tìm tên khóa học, chủ đề, kỹ năng..."
            autoComplete="off"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />

        </div>
        <div className="stats-row" id="statsRow">
          {loading ? (
            <span>⏳ Đang tải...</span>
          ) : !ready ? <span>Chưa xác định được số khóa học chưa đăng ký</span> : (
            <>
              <span>📚 {available.length} khóa học chưa đăng ký</span>
              <span>✅ {enrolledIds.size} đã đăng ký</span>
            </>
          )}
        </div>
      </div>

      {/* Sort bar */}
      <div className="sort-bar">
        <div className="count" id="countLabel">
          {loading ? (
            'Đang tải...'
          ) : !ready ? 'Chưa tải đủ dữ liệu' : (
            <>
              Hiển thị <strong>{filtered.length}</strong> / {available.length} khóa học
            </>
          )}
        </div>
        <select disabled={!ready} aria-label="Sắp xếp khóa học" id="sortSelect" value={currentSort} onChange={(e) => setCurrentSort(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>
      </div>

      {catalog.error && <div className="explore-load-error" role="alert">
        <div><strong>Chưa tải được danh sách khóa học.</strong><p>Vui lòng kiểm tra kết nối và thử lại.</p></div>
        <button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={catalog.retry}>Thử lại danh sách khóa học</button>
      </div>}
      {enrollments.error && <div className="explore-load-error" role="alert">
        <div><strong>Chưa tải được trạng thái đăng ký.</strong><p>Cần kiểm tra các khóa bạn đã đăng ký trước khi hiển thị khóa mới.</p></div>
        <button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={enrollments.retry}>Thử lại trạng thái đăng ký</button>
      </div>}
      {/* Course Grid */}
      <div className="s-course-grid" id="courseGrid">
        {loading && (
          <>
            <div className="skeleton-card">
              <div className="sk sk-thumb"></div>
              <div className="sk-body">
                <div className="sk sk-line w80"></div>
                <div className="sk sk-line w60"></div>
                <div className="sk sk-line w40"></div>
              </div>
            </div>
            <div className="skeleton-card">
              <div className="sk sk-thumb"></div>
              <div className="sk-body">
                <div className="sk sk-line w80"></div>
                <div className="sk sk-line w60"></div>
                <div className="sk sk-line w40"></div>
              </div>
            </div>
            <div className="skeleton-card">
              <div className="sk sk-thumb"></div>
              <div className="sk-body">
                <div className="sk sk-line w80"></div>
                <div className="sk sk-line w60"></div>
                <div className="sk sk-line w40"></div>
              </div>
            </div>
          </>
        )}

        {ready && filtered.length === 0 && (
          // Đã đăng ký hết mọi khóa -> báo riêng, khác với trường hợp lọc không ra kết quả
          <div className="no-result">
            {allCourses.length > 0 && available.length === 0 ? (
              <>
                <div className="icon">🎉</div>
                <h3>Bạn đã đăng ký tất cả khóa học</h3>
                <p>
                  Tiếp tục học tại <Link to="/student/my-courses">Khóa học của tôi</Link>.
                </p>
              </>
            ) : allCourses.length === 0 ? <>
              <div className="icon">📚</div><h3>Chưa có khóa học để khám phá</h3><p>Hãy quay lại khi có khóa học mới.</p>
            </> : (
              <>
                <div className="icon">🔎</div>
                <h3>Không tìm thấy khóa học</h3>
                <p>Thử từ khóa khác nhé.</p>
                {searchVal && <button type="button" className="s-btn s-btn-outline s-btn-sm" onClick={() => setSearchVal('')}>Xóa tìm kiếm</button>}
              </>
            )}
          </div>
        )}

        {ready &&
          filtered.map((c) => {
            const origIdx = allCourses.indexOf(c);
            const { lessons, documents, lvlIdx } = courseMeta(c, origIdx);
            const emoji = EMOJIS[origIdx % EMOJIS.length];
            const color = COLORS[origIdx % COLORS.length];

            return (
              <div key={c.id} className="s-course-card" id={`card-${c.id}`}>
                <div className="s-course-thumb" style={{ background: `linear-gradient(135deg,${color})` }}>
                  <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
                </div>
                <div className="s-course-body">
                  <h3>{c.title || 'Khóa học'}</h3>
                  <p className="teacher">👨‍🏫 {c.teacher_name || 'Giảng viên StudyOnline'}</p>
                  <div className="s-course-meta">
                    <span>📖 {lessons} bài</span>
                    <span>📄 {documents} tài liệu</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span className={`level-badge ${LEVEL_CLS[lvlIdx] || ''}`}>{LEVELS[lvlIdx] || 'Chưa cập nhật trình độ'}</span>
                    {fmtPrice(c.price)}
                  </div>
                </div>
                <div className="s-course-footer">
                  <button className="s-btn s-btn-outline s-btn-sm" onClick={() => openDetail(c)}>
                    🔍 Xem chi tiết
                  </button>
                  <button className="s-btn s-btn-primary s-btn-sm" disabled={enrollingId !== null} aria-busy={enrollingId === Number(c.id)} onClick={() => startEnroll(c)}>
                    {enrollingId === Number(c.id) ? 'Đang đăng ký…' : +c.price > 0 ? '💳 Mua ngay' : '📥 Đăng ký'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Detail Modal */}
      {detailCourse &&
        (() => {
          const origIdx = allCourses.indexOf(detailCourse);
          const { lessons, documents, lvlIdx } = courseMeta(detailCourse, origIdx);
          const color = COLORS[origIdx % COLORS.length];
          return (
            <div className="modal-wrap open" id="detailModal">
              <div className="modal-backdrop" onClick={closeDetail}></div>
              <div className="modal-box">
                <div
                  className="modal-thumb"
                  style={{
                    background: `linear-gradient(135deg,${color})`,
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    borderRadius: '12px 12px 0 0',
                  }}
                >
                  {EMOJIS[origIdx % EMOJIS.length]}
                </div>
                <div className="modal-body">
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                    <span className={`level-badge ${LEVEL_CLS[lvlIdx] || ''}`}>{LEVELS[lvlIdx] || 'Chưa cập nhật trình độ'}</span>
                  </div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '.5rem' }}>{detailCourse.title || 'Khóa học'}</h2>
                  <p style={{ fontSize: '.85rem', color: 'var(--s-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {detailCourse.description || 'Chưa có mô tả.'}
                  </p>
                  <div className="detail-stats">
                    <div>
                      <strong>{lessons}</strong>
                      <span>Bài học</span>
                    </div>
                    <div>
                      <strong>{documents}</strong>
                      <span>Tài liệu</span>
                    </div>
                    <div>
                      <strong>{LEVELS[lvlIdx] || 'Chưa cập nhật trình độ'}</strong>
                      <span>Trình độ</span>
                    </div>
                    <div>
                      <strong>{+detailCourse.price > 0 ? Number(detailCourse.price).toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</strong>
                      <span>Học phí</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
                    <button className="s-btn s-btn-ghost s-btn-sm" style={{ flex: 1 }} onClick={closeDetail}>
                      Đóng
                    </button>
                    <button
                      className="s-btn s-btn-primary"
                      style={{ flex: 2 }}
                      disabled={enrollingId !== null}
                      onClick={() => {
                        const course = detailCourse;
                        closeDetail();
                        startEnroll(course);
                      }}
                    >
                      {+detailCourse.price > 0 ? '💳 Mua khóa học' : '📥 Đăng ký miễn phí'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Payment Modal */}
      {paymentCourse &&
        (() => {
          const origIdx = allCourses.indexOf(paymentCourse);
          const color = COLORS[origIdx % COLORS.length];
          return (
            <div className="modal-wrap open" id="paymentModal">
              <div className="modal-backdrop" onClick={closePayment}></div>
              <div className="modal-box" style={{ maxWidth: 480 }}>
                <div className="modal-body">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'var(--s-surface-2)',
                      borderRadius: '10px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: `linear-gradient(135deg,${color})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {EMOJIS[origIdx % EMOJIS.length]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{paymentCourse.title}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--s-text-muted)' }}>
                        Học phí: <strong style={{ color: 'var(--s-primary)' }}>{Number(paymentCourse.price).toLocaleString('vi-VN')}đ</strong>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💳 Phương thức thanh toán</h3>
                  {/* Một cổng thanh toán duy nhất; chọn ngân hàng tại VNPay. */}
                  <div className="pay-method active" style={{ cursor: 'default' }}>
                    <span style={{ fontWeight: 800, color: '#005BAA' }}>VN</span>
                    <span style={{ fontWeight: 800, color: '#ED1C24', marginRight: 6 }}>PAY</span>
                  </div>
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'var(--s-surface-2)',
                      borderRadius: '8px',
                      fontSize: '.82rem',
                      color: 'var(--s-text-muted)',
                      marginTop: '0.75rem',
                      lineHeight: 1.55,
                    }}
                  >
                    Bạn sẽ được chuyển sang trang thanh toán an toàn của <strong>VNPay</strong>. Sau khi thanh toán
                    thành công, khóa học sẽ được mở ngay. Đơn hàng hết hạn sau 15 phút.
                  </div>

                  {payError && (
                    <div id="payError" className="s-alert s-alert-danger">
                      {payError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
                    <button className="s-btn s-btn-ghost s-btn-sm" style={{ flex: 1 }} onClick={closePayment}>
                      Hủy
                    </button>
                    <button className="s-btn s-btn-primary" style={{ flex: 2 }} id="payBtn" disabled={paying} onClick={doPayment}>
                      {paying
                        ? '⏳ Đang chuyển sang VNPay...'
                        : `Thanh toán ${Number(paymentCourse.price).toLocaleString('vi-VN')}đ qua VNPay`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </main>
  );
}
