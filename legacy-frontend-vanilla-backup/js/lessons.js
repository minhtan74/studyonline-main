// lessons.js — Quản lý bài học

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();
  if (!requireLogin()) return;

  const chapterId = getParam('chapter_id');
  const courseId  = getParam('course_id');
  if (!chapterId) { window.location.href = '/studyonline/frontend/pages/courses.html'; return; }

  const user      = Api.getUser();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const listEl  = document.getElementById('lessonList');
  const alertEl = document.getElementById('alertBox');
  const modalEl = document.getElementById('lessonModal');
  const formEl  = document.getElementById('lessonForm');
  const addBtn  = document.getElementById('addLessonBtn');

  let editingId = null;

  // Breadcrumb
  if (courseId) {
    const cr = await Api.getCourse(Number(courseId));
    if (cr?.ok) {
      const bcCourse = document.getElementById('bcCourse');
      if (bcCourse) { bcCourse.textContent = cr.data.data.title; bcCourse.href = `/studyonline/frontend/pages/teacher/chapters.html?course_id=${courseId}`; }
    }
  }
  const chRes = await Api.getChapter(Number(chapterId));
  if (chRes?.ok) {
    const bcChapter = document.getElementById('bcChapter');
    const titleEl   = document.getElementById('chapterTitle');
    if (bcChapter) bcChapter.textContent = chRes.data.data.chapter_name;
    if (titleEl)   titleEl.textContent   = chRes.data.data.chapter_name;
  }

  async function loadLessons() {
    listEl.innerHTML = `<tr><td colspan="3" class="loading-page"><div class="spinner"></div></td></tr>`;
    const res = await Api.getLessons(Number(chapterId));
    const lessons = res?.data?.data || [];

    if (!lessons.length) {
      listEl.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="icon">📄</div><h3>Chưa có bài học nào</h3></div></td></tr>`;
      return;
    }

    listEl.innerHTML = lessons.map((l, i) => `
      <tr>
        <td><span class="badge badge-success">${i + 1}</span></td>
        <td>
          <a href="/studyonline/frontend/pages/lesson.html?id=${l.id}" style="font-weight:600;">${l.title}</a>
          <div style="font-size:.8rem;color:var(--text-muted);">${l.description?.slice(0,80) || ''}</div>
        </td>
        <td>
          <a class="btn btn-outline btn-sm" href="/studyonline/frontend/pages/lesson.html?id=${l.id}">Xem</a>
          ${isManager ? `
            <button class="btn btn-sm" style="background:var(--surface-2);" onclick="editLesson(${l.id},'${encodeURIComponent(l.title)}','${encodeURIComponent(l.description||'')}')">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="deleteLesson(${l.id})">Xóa</button>
          ` : ''}
        </td>
      </tr>
    `).join('');
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      editingId = null;
      document.getElementById('modalTitle').textContent = 'Thêm bài học';
      formEl.title.value = ''; formEl.description.value = '';
      modalEl.style.display = 'flex';
    });
  }

  document.getElementById('closeModal')?.addEventListener('click', () => modalEl.style.display = 'none');
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) modalEl.style.display = 'none'; });

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;

    const payload = {
      chapter_id:  Number(chapterId),
      title:       formEl.title.value.trim(),
      description: formEl.description.value.trim(),
    };

    const res = editingId
      ? await Api.updateLesson({ id: editingId, ...payload })
      : await Api.createLesson(payload);

    btn.disabled = false;
    if (res?.ok && res.data?.success) {
      modalEl.style.display = 'none';
      showAlert(alertEl, editingId ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
      loadLessons();
    } else {
      showAlert(alertEl, res?.data?.message || 'Có lỗi xảy ra.');
    }
  });

  window.editLesson = (id, title, description) => {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Sửa bài học';
    formEl.title.value       = decodeURIComponent(title);
    formEl.description.value = decodeURIComponent(description);
    modalEl.style.display = 'flex';
  };

  window.deleteLesson = async (id) => {
    if (!confirm('Xóa bài học này?')) return;
    const res = await Api.deleteLesson(id);
    if (res?.ok) { showAlert(alertEl, 'Xóa thành công!', 'success'); loadLessons(); }
  };

  if (!isManager && addBtn) addBtn.style.display = 'none';
  loadLessons();
});
