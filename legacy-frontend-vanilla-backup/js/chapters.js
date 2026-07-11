// chapters.js — Quản lý chương học

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();
  if (!requireLogin()) return;

  const courseId = getParam('course_id');
  if (!courseId) { window.location.href = '/studyonline/frontend/pages/courses.html'; return; }

  const user      = Api.getUser();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const listEl    = document.getElementById('chapterList');
  const alertEl   = document.getElementById('alertBox');
  const modalEl   = document.getElementById('chapterModal');
  const formEl    = document.getElementById('chapterForm');
  const addBtn    = document.getElementById('addChapterBtn');
  const titleEl   = document.getElementById('courseTitle');

  let editingId = null;

  // Load tên khóa học
  const courseRes = await Api.getCourse(Number(courseId));
  if (courseRes?.ok && courseRes.data?.data) {
    if (titleEl) titleEl.textContent = courseRes.data.data.title;
    const bcCourse = document.getElementById('bcCourse');
    if (bcCourse) bcCourse.textContent = courseRes.data.data.title;
  }

  async function loadChapters() {
    listEl.innerHTML = `<tr><td colspan="3" class="loading-page"><div class="spinner"></div></td></tr>`;
    const res = await Api.getChapters(Number(courseId));
    const chapters = res?.data?.data || [];

    if (!chapters.length) {
      listEl.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="icon">📂</div><h3>Chưa có chương nào</h3></div></td></tr>`;
      return;
    }

    listEl.innerHTML = chapters.map((ch, i) => `
      <tr>
        <td><span class="badge badge-primary">${i + 1}</span></td>
        <td><strong>${ch.chapter_name}</strong></td>
        <td>
          <a class="btn btn-outline btn-sm" href="/studyonline/frontend/pages/teacher/lessons.html?chapter_id=${ch.id}&course_id=${courseId}">Xem bài học</a>
          ${isManager ? `
            <button class="btn btn-sm" style="background:var(--surface-2);" onclick="editChapter(${ch.id},'${encodeURIComponent(ch.chapter_name)}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="deleteChapter(${ch.id})">Xóa</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      editingId = null;
      document.getElementById('modalTitle').textContent = 'Thêm chương';
      formEl.chapter_name.value = '';
      modalEl.style.display = 'flex';
    });
  }

  document.getElementById('closeModal')?.addEventListener('click', () => modalEl.style.display = 'none');
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) modalEl.style.display = 'none'; });

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;

    const payload = { course_id: Number(courseId), chapter_name: formEl.chapter_name.value.trim() };
    let res;
    if (editingId) {
      res = await Api.updateChapter({ id: editingId, ...payload });
    } else {
      res = await Api.createChapter(payload);
    }

    btn.disabled = false;
    if (res?.ok && res.data?.success) {
      modalEl.style.display = 'none';
      showAlert(alertEl, editingId ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
      loadChapters();
    } else {
      showAlert(alertEl, res?.data?.message || 'Có lỗi xảy ra.');
    }
  });

  window.editChapter = (id, name) => {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Sửa chương';
    formEl.chapter_name.value = decodeURIComponent(name);
    modalEl.style.display = 'flex';
  };

  window.deleteChapter = async (id) => {
    if (!confirm('Xóa chương này?')) return;
    const res = await Api.deleteChapter(id);
    if (res?.ok) { showAlert(alertEl, 'Xóa thành công!', 'success'); loadChapters(); }
  };

  if (!isManager && addBtn) addBtn.style.display = 'none';
  loadChapters();
});
