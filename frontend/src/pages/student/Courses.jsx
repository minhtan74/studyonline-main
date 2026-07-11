import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../hooks/useToast';
import '../../assets/css/student-courses.css';

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
const CATS = ['web', 'mobile', 'data', 'design', 'backend', 'other'];
const CAT_LABELS = ['🌐 Web', '📱 Mobile', '📊 Data', '🎨 Design', '⚙️ Backend', '📦 Khác'];
const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
const LEVEL_DB = ['beginner', 'intermediate', 'advanced'];
const LEVEL_CLS = ['level-begin', 'level-mid', 'level-adv'];

const CAT_PILLS = [
  { key: 'all', label: '🌟 Tất cả' },
  { key: 'web', label: '🌐 Web' },
  { key: 'mobile', label: '📱 Mobile' },
  { key: 'data', label: '📊 Data' },
  { key: 'design', label: '🎨 Design' },
  { key: 'backend', label: '⚙️ Backend' },
  { key: 'other', label: '📦 Khác' },
];

const PAY_METHODS = [
  { key: 'card', label: '💳 Thẻ tín dụng / Ghi nợ' },
  { key: 'momo', label: '🟣 MoMo' },
  { key: 'zalopay', label: '🔵 ZaloPay' },
  { key: 'bank_transfer', label: '🏦 Chuyển khoản ngân hàng' },
];

// courseMeta() — hàm deterministic theo course.id, giữ nguyên công thức gốc dù có vẻ "hack"
// (thay thế cho các trường lessons/hours/level/category chưa có thật ở backend)
function courseMeta(c, i) {
  const lessons = 5 + ((c.id || i) * 7) % 20;
  const hours = (lessons * 0.5).toFixed(0);
  const lvlIdx = LEVEL_DB.indexOf(c.level) >= 0 ? LEVEL_DB.indexOf(c.level) : (c.id || i) % 3;
  const catIdx = (c.id || i) % CATS.length;
  return { lessons, hours, lvlIdx, catIdx };
}

function fmtPrice(p) {
  if (!p || p <= 0) return <span className="price-free">🆓 Miễn phí</span>;
  return <span className="price-paid">{Number(p).toLocaleString('vi-VN')}đ</span>;
}

function fmtCardNumber(v) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function fmtExpiry(v) {
  let d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
  return d;
}

/** Tương đương _legacy/pages/student/courses.html + _legacy/js/student-courses.js */
export default function Courses() {
  const { showToast } = useToast();

  const [allCourses, setAllCourses] = useState(null); // null = đang tải
  const [enrolledIds, setEnrolledIds] = useState(new Set());

  const [searchVal, setSearchVal] = useState('');
  const [currentCat, setCurrentCat] = useState('all');
  const [currentSort, setCurrentSort] = useState('newest');

  const [detailCourse, setDetailCourse] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [payError, setPayError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payFailed, setPayFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const [coursesRes, enrollRes] = await Promise.allSettled([courseService.getCourses(), enrollmentService.getEnrolledIds()]);
      setAllCourses(coursesRes?.value?.data?.data || []);
      const rawIds = enrollRes?.value?.data?.data;
      setEnrolledIds(new Set(Array.isArray(rawIds) ? rawIds.map(Number) : []));
    })();
  }, []);

  useEffect(() => {
    document.body.style.overflow = detailCourse || paymentCourse ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [detailCourse, paymentCourse]);

  const filtered = useMemo(() => {
    if (!allCourses) return [];
    let list = allCourses.filter((c, i) => {
      const { catIdx } = courseMeta(c, i);
      const matchCat = currentCat === 'all' || CATS[catIdx] === currentCat;
      const q = searchVal.toLowerCase();
      const matchSearch = !q || (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
    if (currentSort === 'az') list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (currentSort === 'za') list = [...list].sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    if (currentSort === 'price_asc') list = [...list].sort((a, b) => (+a.price || 0) - (+b.price || 0));
    if (currentSort === 'price_desc') list = [...list].sort((a, b) => (+b.price || 0) - (+a.price || 0));
    return list;
  }, [allCourses, currentCat, searchVal, currentSort]);

  function openDetail(course) {
    setDetailCourse(course);
  }
  function closeDetail() {
    setDetailCourse(null);
  }

  function openPayment(course) {
    setPaymentCourse(course);
    setPayMethod('card');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setPayError(null);
    setPayFailed(false);
  }
  function closePayment() {
    setPaymentCourse(null);
  }

  function startEnroll(course) {
    if (+course.price > 0) {
      openPayment(course);
    } else {
      doFreeEnroll(course.id);
    }
  }

  async function doFreeEnroll(courseId) {
    showToast('⏳ Đang đăng ký...', 'info');
    const res = await enrollmentService.enroll(courseId);
    if (res?.data?.success) {
      setEnrolledIds((prev) => new Set(prev).add(courseId));
      showToast('✅ Đăng ký khóa học thành công!', 'success');
    } else {
      showToast('❌ ' + (res?.data?.message || 'Đăng ký thất bại'), 'error');
    }
  }

  async function doPayment() {
    setPayError(null);

    if (payMethod === 'card') {
      const num = cardNumber.replace(/\s/g, '');
      const name = cardName.trim();
      if (num.length < 16 || !name || cardExpiry.trim().length < 5 || cardCvv.trim().length < 3) {
        setPayError('⚠️ Vui lòng điền đầy đủ thông tin thẻ.');
        return;
      }
    }

    setPaying(true);
    // Mô phỏng delay thanh toán
    await new Promise((r) => setTimeout(r, 1500));

    const res = await paymentService.pay(paymentCourse.id, payMethod, { card_name: cardName });
    setPaying(false);

    if (res?.data?.success) {
      setEnrolledIds((prev) => new Set(prev).add(paymentCourse.id));
      closePayment();
      showToast(`✅ Thanh toán thành công! Mã GD: ${res.data.data?.transaction_ref || ''}`, 'success');
    } else {
      setPayFailed(true);
      setPayError('❌ ' + (res?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.'));
    }
  }

  return (
    <main className="s-main">
      {/* Hero */}
      <div className="explore-hero">
        <h1>🌐 Khám phá khóa học</h1>
        <p>Tìm kiếm và đăng ký hàng trăm khóa học chất lượng cao — học bất cứ lúc nào.</p>
        <div className="hero-search">
          <input
            type="text"
            id="heroSearch"
            placeholder="Tìm tên khóa học, chủ đề, kỹ năng..."
            autoComplete="off"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <button onClick={() => {}}>🔍 Tìm kiếm</button>
        </div>
        <div className="stats-row" id="statsRow">
          {allCourses === null ? (
            <span>⏳ Đang tải...</span>
          ) : (
            <>
              <span>📚 {allCourses.length} khóa học</span>
              <span>👨‍🏫 Nhiều giảng viên</span>
              <span>✅ {enrolledIds.size} đã đăng ký</span>
            </>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="cat-pills" id="catPills">
        {CAT_PILLS.map((p) => (
          <button key={p.key} className={`cat-pill${currentCat === p.key ? ' active' : ''}`} onClick={() => setCurrentCat(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div className="sort-bar">
        <div className="count" id="countLabel">
          {allCourses === null ? (
            'Đang tải...'
          ) : (
            <>
              Hiển thị <strong>{filtered.length}</strong> / {allCourses.length} khóa học
            </>
          )}
        </div>
        <select id="sortSelect" value={currentSort} onChange={(e) => setCurrentSort(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="s-course-grid" id="courseGrid">
        {allCourses === null && (
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

        {allCourses !== null && filtered.length === 0 && (
          <div className="no-result">
            <div className="icon">🔎</div>
            <h3>Không tìm thấy khóa học</h3>
            <p>Thử từ khóa khác hoặc chọn danh mục khác nhé.</p>
          </div>
        )}

        {allCourses !== null &&
          filtered.map((c) => {
            const origIdx = allCourses.indexOf(c);
            const { lessons, hours, lvlIdx, catIdx } = courseMeta(c, origIdx);
            const emoji = EMOJIS[origIdx % EMOJIS.length];
            const color = COLORS[origIdx % COLORS.length];
            const isNew = origIdx < 3;
            const isEnrolled = enrolledIds.has(c.id);

            return (
              <div key={c.id} className="s-course-card" id={`card-${c.id}`}>
                <div className="s-course-thumb" style={{ background: `linear-gradient(135deg,${color})` }}>
                  {isNew && !isEnrolled && <span className="enroll-badge">🆕 Mới</span>}
                  {isEnrolled && <span className="enroll-badge enrolled-badge">✅ Đã đăng ký</span>}
                  <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
                </div>
                <div className="s-course-body">
                  <h3>{c.title || 'Khóa học'}</h3>
                  <p className="teacher">👨‍🏫 {c.teacher_name || 'Giảng viên StudyOnline'}</p>
                  <div className="s-course-meta">
                    <span>📖 {lessons} bài</span>
                    <span>⏱ {hours}h</span>
                    <span>{CAT_LABELS[catIdx]}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span className={`level-badge ${LEVEL_CLS[lvlIdx]}`}>{LEVELS[lvlIdx]}</span>
                    {fmtPrice(c.price)}
                  </div>
                </div>
                <div className="s-course-footer">
                  <button className="s-btn s-btn-outline s-btn-sm" onClick={() => openDetail(c)}>
                    🔍 Xem chi tiết
                  </button>
                  {isEnrolled ? (
                    <Link to={`/chapters?course_id=${c.id}`} className="s-btn s-btn-primary s-btn-sm">
                      ▶ Vào học
                    </Link>
                  ) : (
                    <button className="s-btn s-btn-primary s-btn-sm" onClick={() => startEnroll(c)}>
                      {+c.price > 0 ? '💳 Mua ngay' : '📥 Đăng ký'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Detail Modal */}
      {detailCourse &&
        (() => {
          const origIdx = allCourses.indexOf(detailCourse);
          const { lessons, hours, lvlIdx, catIdx } = courseMeta(detailCourse, origIdx);
          const color = COLORS[origIdx % COLORS.length];
          const isEnrolled = enrolledIds.has(detailCourse.id);
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
                    <span className={`level-badge ${LEVEL_CLS[lvlIdx]}`}>{LEVELS[lvlIdx]}</span>
                    <span className="s-badge s-badge-blue">{CAT_LABELS[catIdx]}</span>
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
                      <strong>{hours}h</strong>
                      <span>Thời lượng</span>
                    </div>
                    <div>
                      <strong>{LEVELS[lvlIdx]}</strong>
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
                    {isEnrolled ? (
                      <Link
                        to={`/chapters?course_id=${detailCourse.id}`}
                        className="s-btn s-btn-primary"
                        style={{ flex: 2, justifyContent: 'center' }}
                      >
                        ▶ Vào học ngay
                      </Link>
                    ) : (
                      <button
                        className="s-btn s-btn-primary"
                        style={{ flex: 2 }}
                        onClick={() => {
                          const course = detailCourse;
                          closeDetail();
                          startEnroll(course);
                        }}
                      >
                        {+detailCourse.price > 0 ? '💳 Mua khóa học' : '📥 Đăng ký miễn phí'}
                      </button>
                    )}
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

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💳 Chọn phương thức thanh toán</h3>
                  <div className="pay-methods">
                    {PAY_METHODS.map((m) => (
                      <label key={m.key} className={`pay-method${payMethod === m.key ? ' active' : ''}`}>
                        <input
                          type="radio"
                          name="payMethod"
                          value={m.key}
                          checked={payMethod === m.key}
                          onChange={() => setPayMethod(m.key)}
                        />{' '}
                        {m.label}
                      </label>
                    ))}
                  </div>

                  {payMethod === 'card' ? (
                    <div id="cardForm" style={{ marginTop: '1rem' }}>
                      <div className="s-form-group">
                        <label className="s-label">Số thẻ</label>
                        <input
                          className="s-input"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(fmtCardNumber(e.target.value))}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                        <div className="s-form-group">
                          <label className="s-label">Họ tên chủ thẻ</label>
                          <input
                            className="s-input"
                            placeholder="NGUYEN VAN A"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                        </div>
                        <div className="s-form-group">
                          <label className="s-label">Ngày hết hạn</label>
                          <input
                            className="s-input"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(fmtExpiry(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="s-form-group">
                        <label className="s-label">CVV</label>
                        <input
                          className="s-input"
                          placeholder="123"
                          maxLength={3}
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      id="altPayInfo"
                      style={{
                        padding: '1rem',
                        background: 'var(--s-surface-2)',
                        borderRadius: '8px',
                        fontSize: '.85rem',
                        color: 'var(--s-text-muted)',
                        marginTop: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      Bạn sẽ được chuyển tới ứng dụng thanh toán sau khi xác nhận.
                    </div>
                  )}

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
                        ? '⏳ Đang xử lý...'
                        : payFailed
                          ? 'Thử lại'
                          : `Thanh toán ${Number(paymentCourse.price).toLocaleString('vi-VN')}đ`}
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
