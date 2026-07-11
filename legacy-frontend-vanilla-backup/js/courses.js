// courses.js — Quản lý khóa học (CRUD)

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();
  if (!requireLogin()) return;

  const user      = Api.getUser();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const listEl    = document.getElementById('courseList');
  const alertEl   = document.getElementById('alertBox');
  const modalEl   = document.getElementById('courseModal');
  const formEl    = document.getElementById('courseForm');
  const addBtn    = document.getElementById('addCourseBtn');

  let editingId = null;

  // ── Load danh sách ──────────────────────────────────────
  async function loadCourses() {
    listEl.innerHTML = `<tr><td colspan="4" class="loading-page"><div class="spinner"></div></td></tr>`;
    const res = await Api.getCourses();
    if (!res?.ok) { listEl.innerHTML = `<tr><td colspan="4">Lỗi tải dữ liệu</td></tr>`; return; }

    const courses = res.data.data;
    if (!courses.length) {
      listEl.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">📚</div><h3>Chưa có khóa học nào</h3></div></td></tr>`;
      return;
    }

    listEl.innerHTML = courses.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.75rem;">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;flex-shrink:0;">📘</div>
            <div>
              <strong>${c.title}</strong>
              <div style="font-size:.8rem;color:var(--text-muted);">${c.description?.slice(0,60) || ''}...</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary">${c.id}</span></td>
        <td>
          <a class="btn btn-outline btn-sm" href="/studyonline/frontend/pages/teacher/dashboard.html?course_id=${c.id}#chapters">Xem chương</a>
          ${isManager ? `
            <button class="btn btn-sm" style="background:var(--surface-2);" onclick="editCourse(${c.id},'${encodeURIComponent(c.title)}','${encodeURIComponent(c.description||'')}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Xóa</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  // ── Mở modal Thêm ──────────────────────────────────────
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      editingId = null;
      document.getElementById('modalTitle').textContent = 'Thêm khóa học';
      formEl.title.value = '';
      formEl.description.value = '';
      modalEl.style.display = 'flex';
    });
  }

  // ── Đóng modal ─────────────────────────────────────────
  document.getElementById('closeModal')?.addEventListener('click', () => {
    modalEl.style.display = 'none';
  });
  modalEl?.addEventListener('click', (e) => { if (e.target === modalEl) modalEl.style.display = 'none'; });

  // ── Submit form ────────────────────────────────────────
  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;

    const payload = {
      title:       formEl.title.value.trim(),
      description: formEl.description.value.trim(),
    };

    let res;
    if (editingId) {
      res = await Api.updateCourse({ id: editingId, ...payload });
    } else {
      res = await Api.createCourse(payload);
    }

    btn.disabled = false;
    if (res?.ok && res.data?.success) {
      modalEl.style.display = 'none';
      showAlert(alertEl, editingId ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
      loadCourses();
    } else {
      showAlert(alertEl, res?.data?.message || 'Có lỗi xảy ra.');
    }
  });

  // ── Global functions ───────────────────────────────────
  window.editCourse = (id, title, description) => {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Sửa khóa học';
    formEl.title.value       = decodeURIComponent(title);
    formEl.description.value = decodeURIComponent(description);
    modalEl.style.display = 'flex';
  };

  window.deleteCourse = async (id) => {
    if (!confirm('Bạn chắc muốn xóa khóa học này?')) return;
    const res = await Api.deleteCourse(id);
    if (res?.ok) {
      showAlert(alertEl, 'Xóa thành công!', 'success');
      loadCourses();
    }
  };

  // Ẩn nút thêm nếu không phải manager
  if (!isManager && addBtn) addBtn.style.display = 'none';

  loadCourses();
});
