/**
 * student-courses.js
 * Logic trang Danh sách / Khám phá khóa học (Student)
 */

const EMOJIS = ['🎨','💻','📊','🔬','🌐','📱','🎵','✏️','🧪','📐','🚀','🔐'];
const COLORS  = ['#2563EB,#8B5CF6','#0F766E,#06B6D4','#7C3AED,#EC4899',
                 '#DC2626,#F59E0B','#059669,#2563EB','#D97706,#EF4444',
                 '#1D4ED8,#06B6D4','#7C3AED,#2563EB'];
const CATS    = ['web','mobile','data','design','backend','other'];
const CAT_LABELS = ['🌐 Web','📱 Mobile','📊 Data','🎨 Design','⚙️ Backend','📦 Khác'];
const LEVELS  = ['Cơ bản','Trung cấp','Nâng cao'];
const LEVEL_DB = ['beginner','intermediate','advanced'];
const LEVEL_CLS = ['level-begin','level-mid','level-adv'];

let allCourses = [], enrolledIds = new Set();
let searchVal = '', currentCat = 'all', currentSort = 'newest';

/* ─── Meta helpers ─── */
function courseMeta(c, i) {
  const lessons = 5 + ((c.id||i)*7)%20;
  const hours   = (lessons*0.5).toFixed(0);
  const lvlIdx  = LEVEL_DB.indexOf(c.level) >= 0 ? LEVEL_DB.indexOf(c.level) : (c.id||i)%3;
  const catIdx  = (c.id||i) % CATS.length;
  return { lessons, hours, lvlIdx, catIdx };
}

function fmtPrice(p) {
  if (!p || p <= 0) return '<span class="price-free">🆓 Miễn phí</span>';
  return `<span class="price-paid">${Number(p).toLocaleString('vi-VN')}đ</span>`;
}

/* ─── Filter ─── */
function filtered() {
  let list = allCourses.filter((c,i) => {
    const { catIdx } = courseMeta(c,i);
    const matchCat = currentCat === 'all' || CATS[catIdx] === currentCat;
    const q = searchVal.toLowerCase();
    const matchSearch = !q || (c.title||'').toLowerCase().includes(q) || (c.description||'').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  if (currentSort === 'az') list.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  if (currentSort === 'za') list.sort((a,b)=>(b.title||'').localeCompare(a.title||''));
  if (currentSort === 'price_asc') list.sort((a,b)=>(+a.price||0)-(+b.price||0));
  if (currentSort === 'price_desc') list.sort((a,b)=>(+b.price||0)-(+a.price||0));
  return list;
}

/* ─── Render grid ─── */
function renderGrid() {
  const grid = document.getElementById('courseGrid');
  const list = filtered();
  document.getElementById('countLabel').innerHTML =
    `Hiển thị <strong>${list.length}</strong> / ${allCourses.length} khóa học`;

  if (!list.length) {
    grid.innerHTML = `<div class="no-result"><div class="icon">🔎</div>
      <h3>Không tìm thấy khóa học</h3><p>Thử từ khóa khác hoặc chọn danh mục khác nhé.</p></div>`;
    return;
  }

  grid.innerHTML = list.map((c, idx) => {
    const origIdx = allCourses.indexOf(c);
    const { lessons, hours, lvlIdx, catIdx } = courseMeta(c, origIdx);
    const emoji  = EMOJIS[origIdx % EMOJIS.length];
    const color  = COLORS[origIdx % COLORS.length];
    const isNew  = origIdx < 3;
    const isEnrolled = enrolledIds.has(c.id);

    return `<div class="s-course-card" id="card-${c.id}">
      <div class="s-course-thumb" style="background:linear-gradient(135deg,${color});">
        ${isNew && !isEnrolled ? '<span class="enroll-badge">🆕 Mới</span>' : ''}
        ${isEnrolled ? '<span class="enroll-badge enrolled-badge">✅ Đã đăng ký</span>' : ''}
        <span style="font-size:2.5rem;">${emoji}</span>
      </div>
      <div class="s-course-body">
        <h3>${c.title||'Khóa học'}</h3>
        <p class="teacher">👨‍🏫 ${c.teacher_name||'Giảng viên StudyOnline'}</p>
        <div class="s-course-meta">
          <span>📖 ${lessons} bài</span>
          <span>⏱ ${hours}h</span>
          <span>${CAT_LABELS[catIdx]}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
          <span class="level-badge ${LEVEL_CLS[lvlIdx]}">${LEVELS[lvlIdx]}</span>
          ${fmtPrice(c.price)}
        </div>
      </div>
      <div class="s-course-footer">
        <button class="s-btn s-btn-outline s-btn-sm" onclick="openDetail(${c.id})">🔍 Xem chi tiết</button>
        ${isEnrolled
          ? `<a href="/studyonline/frontend/pages/chapters.html?course_id=${c.id}" class="s-btn s-btn-primary s-btn-sm">▶ Vào học</a>`
          : `<button class="s-btn s-btn-primary s-btn-sm" onclick="startEnroll(${c.id})">${+c.price>0?'💳 Mua ngay':'📥 Đăng ký'}</button>`
        }
      </div>
    </div>`;
  }).join('');
}

/* ─── Detail Modal ─── */
function openDetail(courseId) {
  const c = allCourses.find(x => x.id === courseId);
  if (!c) return;
  const origIdx = allCourses.indexOf(c);
  const { lessons, hours, lvlIdx, catIdx } = courseMeta(c, origIdx);
  const color = COLORS[origIdx % COLORS.length];
  const isEnrolled = enrolledIds.has(c.id);

  document.getElementById('detailModal').innerHTML = `
    <div class="modal-backdrop" onclick="closeDetail()"></div>
    <div class="modal-box">
      <div class="modal-thumb" style="background:linear-gradient(135deg,${color});height:160px;display:flex;align-items:center;justify-content:center;font-size:4rem;border-radius:12px 12px 0 0;">
        ${EMOJIS[origIdx % EMOJIS.length]}
      </div>
      <div class="modal-body">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;">
          <span class="level-badge ${LEVEL_CLS[lvlIdx]}">${LEVELS[lvlIdx]}</span>
          <span class="s-badge s-badge-blue">${CAT_LABELS[catIdx]}</span>
        </div>
        <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:.5rem;">${c.title||'Khóa học'}</h2>
        <p style="font-size:.85rem;color:var(--s-text-muted);margin-bottom:1rem;line-height:1.6;">${c.description||'Chưa có mô tả.'}</p>
        <div class="detail-stats">
          <div><strong>${lessons}</strong><span>Bài học</span></div>
          <div><strong>${hours}h</strong><span>Thời lượng</span></div>
          <div><strong>${LEVELS[lvlIdx]}</strong><span>Trình độ</span></div>
          <div><strong>${+c.price>0?Number(c.price).toLocaleString('vi-VN')+'đ':'Miễn phí'}</strong><span>Học phí</span></div>
        </div>
        <div style="display:flex;gap:.75rem;margin-top:1.25rem;">
          <button class="s-btn s-btn-ghost s-btn-sm" style="flex:1" onclick="closeDetail()">Đóng</button>
          ${isEnrolled
            ? `<a href="/studyonline/frontend/pages/chapters.html?course_id=${c.id}" class="s-btn s-btn-primary" style="flex:2;justify-content:center;">▶ Vào học ngay</a>`
            : `<button class="s-btn s-btn-primary" style="flex:2;" onclick="closeDetail();startEnroll(${c.id})">${+c.price>0?'💳 Mua khóa học':'📥 Đăng ký miễn phí'}</button>`
          }
        </div>
      </div>
    </div>`;
  document.getElementById('detailModal').style.display='flex';
  document.body.style.overflow='hidden';
}
function closeDetail() {
  document.getElementById('detailModal').style.display='none';
  document.body.style.overflow='';
}

/* ─── Payment / Enroll ─── */
function startEnroll(courseId) {
  const c = allCourses.find(x=>x.id===courseId);
  if (!c) return;
  if (+c.price > 0) {
    openPayment(c);
  } else {
    doFreeEnroll(courseId);
  }
}

async function doFreeEnroll(courseId) {
  showToast('⏳ Đang đăng ký...', 'info');
  const res = await Api.enroll(courseId);
  if (res?.data?.success) {
    enrolledIds.add(courseId);
    renderGrid();
    showToast('✅ Đăng ký khóa học thành công!', 'success');
  } else {
    showToast('❌ ' + (res?.data?.message || 'Đăng ký thất bại'), 'error');
  }
}

function openPayment(course) {
  const origIdx = allCourses.indexOf(course);
  const color = COLORS[origIdx % COLORS.length];
  document.getElementById('paymentModal').innerHTML = `
    <div class="modal-backdrop" onclick="closePayment()"></div>
    <div class="modal-box" style="max-width:480px;">
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--s-surface-2);border-radius:10px;margin-bottom:1.25rem;">
          <div style="width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,${color});display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${EMOJIS[origIdx%EMOJIS.length]}</div>
          <div><div style="font-weight:700;font-size:.9rem;">${course.title}</div>
          <div style="font-size:.85rem;color:var(--s-text-muted);">Học phí: <strong style="color:var(--s-primary);">${Number(course.price).toLocaleString('vi-VN')}đ</strong></div></div>
        </div>
        <h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem;">💳 Chọn phương thức thanh toán</h3>
        <div class="pay-methods">
          <label class="pay-method active" data-method="card"><input type="radio" name="payMethod" value="card" checked> 💳 Thẻ tín dụng / Ghi nợ</label>
          <label class="pay-method" data-method="momo"><input type="radio" name="payMethod" value="momo"> 🟣 MoMo</label>
          <label class="pay-method" data-method="zalopay"><input type="radio" name="payMethod" value="zalopay"> 🔵 ZaloPay</label>
          <label class="pay-method" data-method="bank_transfer"><input type="radio" name="payMethod" value="bank_transfer"> 🏦 Chuyển khoản ngân hàng</label>
        </div>
        <div id="cardForm" style="margin-top:1rem;">
          <div class="s-form-group">
            <label class="s-label">Số thẻ</label>
            <input class="s-input" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" oninput="fmtCard(this)">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
            <div class="s-form-group"><label class="s-label">Họ tên chủ thẻ</label><input class="s-input" id="cardName" placeholder="NGUYEN VAN A"></div>
            <div class="s-form-group"><label class="s-label">Ngày hết hạn</label><input class="s-input" id="cardExpiry" placeholder="MM/YY" maxlength="5" oninput="fmtExpiry(this)"></div>
          </div>
          <div class="s-form-group"><label class="s-label">CVV</label><input class="s-input" id="cardCvv" placeholder="123" maxlength="3" type="password"></div>
        </div>
        <div id="altPayInfo" style="display:none;padding:1rem;background:var(--s-surface-2);border-radius:8px;font-size:.85rem;color:var(--s-text-muted);margin-top:1rem;text-align:center;">
          Bạn sẽ được chuyển tới ứng dụng thanh toán sau khi xác nhận.
        </div>
        <div id="payError" style="display:none;" class="s-alert s-alert-danger"></div>
        <div style="display:flex;gap:.75rem;margin-top:1.25rem;">
          <button class="s-btn s-btn-ghost s-btn-sm" style="flex:1" onclick="closePayment()">Hủy</button>
          <button class="s-btn s-btn-primary" style="flex:2;" id="payBtn" onclick="doPayment(${course.id})">Thanh toán ${Number(course.price).toLocaleString('vi-VN')}đ</button>
        </div>
      </div>
    </div>`;
  document.getElementById('paymentModal').style.display='flex';
  document.body.style.overflow='hidden';

  // Method toggle
  document.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      const m = el.dataset.method;
      document.getElementById('cardForm').style.display = m==='card'?'block':'none';
      document.getElementById('altPayInfo').style.display = m!=='card'?'block':'none';
    });
  });
}

function fmtCard(el) {
  let v = el.value.replace(/\D/g,'').slice(0,16);
  el.value = v.replace(/(.{4})/g,'$1 ').trim();
}
function fmtExpiry(el) {
  let v = el.value.replace(/\D/g,'').slice(0,4);
  if (v.length>=3) v = v.slice(0,2)+'/'+v.slice(2);
  el.value = v;
}

async function doPayment(courseId) {
  const btn = document.getElementById('payBtn');
  const errEl = document.getElementById('payError');
  const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';
  errEl.style.display='none';

  // Validate thẻ
  if (method === 'card') {
    const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const name = document.getElementById('cardName').value.trim();
    const expiry = document.getElementById('cardExpiry').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();
    if (num.length < 16 || !name || expiry.length < 5 || cvv.length < 3) {
      errEl.textContent = '⚠️ Vui lòng điền đầy đủ thông tin thẻ.';
      errEl.style.display='block'; return;
    }
  }

  btn.disabled = true;
  btn.textContent = '⏳ Đang xử lý...';

  // Mô phỏng delay thanh toán
  await new Promise(r => setTimeout(r, 1500));

  const res = await Api.pay(courseId, method, { card_name: document.getElementById('cardName')?.value });

  if (res?.data?.success) {
    enrolledIds.add(courseId);
    renderGrid();
    closePayment();
    showToast(`✅ Thanh toán thành công! Mã GD: ${res.data.data?.transaction_ref||''}`, 'success');
  } else {
    btn.disabled=false;
    btn.textContent='Thử lại';
    errEl.textContent = '❌ ' + (res?.data?.message||'Thanh toán thất bại. Vui lòng thử lại.');
    errEl.style.display='block';
  }
}
function closePayment() {
  document.getElementById('paymentModal').style.display='none';
  document.body.style.overflow='';
}

/* ─── Toast ─── */
function showToast(msg, type='success') {
  const t = document.getElementById('toastContainer');
  const id = 'toast-'+Date.now();
  const colors = { success:'#10B981', error:'#EF4444', info:'#2563EB' };
  const el = document.createElement('div');
  el.id = id;
  el.className = 'toast-item';
  el.style.cssText = `border-left:4px solid ${colors[type]||colors.success}`;
  el.textContent = msg;
  t.appendChild(el);
  setTimeout(()=>el.classList.add('toast-show'),10);
  setTimeout(()=>{ el.classList.remove('toast-show'); setTimeout(()=>el.remove(),350); }, 3500);
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireLogin()) return;

  const user = Api.getUser();
  if (user) {
    document.getElementById('headerAvatar').textContent = (user.fullname||'U').charAt(0).toUpperCase();
    document.getElementById('headerName').textContent = user.fullname?.split(' ').pop()||'Học viên';
  }

  // Load song song — dùng allSettled để tránh crash nếu 1 API lỗi
  const [coursesRes, enrollRes] = await Promise.allSettled([
    Api.getCourses(),
    Api.getEnrolledIds()
  ]);
  allCourses = coursesRes?.value?.data?.data || [];
  const rawIds = enrollRes?.value?.data?.data;
  enrolledIds = new Set(Array.isArray(rawIds) ? rawIds.map(Number) : []);

  // Stats
  document.getElementById('statsRow').innerHTML = `
    <span>📚 ${allCourses.length} khóa học</span>
    <span>👨‍🏫 Nhiều giảng viên</span>
    <span>✅ ${enrolledIds.size} đã đăng ký</span>`;

  renderGrid();

  // Search
  const heroInput = document.getElementById('heroSearch');
  heroInput.addEventListener('input', e => { searchVal=e.target.value.trim(); renderGrid(); });
  heroInput.addEventListener('keydown', e => { if(e.key==='Enter'){ searchVal=e.target.value.trim(); renderGrid(); } });

  // Category pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderGrid();
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    currentSort = e.target.value; renderGrid();
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('studentSidebar').classList.toggle('mobile-open');
    const ov = document.getElementById('sidebarOverlay');
    ov.style.display = ov.style.display==='none'?'block':'none';
  });

  // Avatar dropdown
  document.getElementById('avatarWrap')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('avatarDropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => document.getElementById('avatarDropdown')?.classList.remove('open'));
});
