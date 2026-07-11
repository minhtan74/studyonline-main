// quiz.js — Quản lý Quiz, câu hỏi, làm bài, xem kết quả

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar();

  const page = document.body.dataset.page;

  if (page === 'quiz-list')    return initQuizList();
  if (page === 'quiz-show')    return initQuizShow();
  if (page === 'quiz-result')  return initQuizResult();
  if (page === 'quiz-manage')  return initQuizManage();
  if (page === 'quiz-questions') return initQuizQuestions();
});

// ── DANH SÁCH QUIZ ──────────────────────────────────────
async function initQuizList() {
  if (!requireLogin()) return;
  const courseId = getParam('course_id');
  const listEl   = document.getElementById('quizList');
  const user     = Api.getUser();
  const isManager = user?.role === 'admin' || user?.role === 'teacher';

  const res    = await Api.getQuizzes(courseId);
  const quizzes = res?.data?.data || [];

  if (!quizzes.length) {
    listEl.innerHTML = `<div class="s-empty"><div class="icon">📝</div><h3>Chưa có quiz nào</h3></div>`;
    return;
  }

  listEl.innerHTML = quizzes.map(q => `
    <div class="s-card" style="margin-bottom:1rem;">
      <div class="s-card-body" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <div>
          <h3 style="font-size:1.05rem;margin-bottom:.25rem;font-weight:700;">${q.title}</h3>
          <span class="s-badge s-badge-blue">${q.question_count} câu hỏi</span>
          ${q.course_title ? `<span class="s-badge s-badge-green" style="margin-left:.5rem;">${q.course_title}</span>` : ''}
          <p style="margin-top:.5rem;font-size:.875rem;color:var(--s-text-muted);">${q.description || ''}</p>
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
          <a class="s-btn s-btn-primary s-btn-sm" href="/studyonline/frontend/pages/quiz-show.html?id=${q.id}">Làm bài</a>
          ${isManager ? `
            <a class="s-btn s-btn-outline s-btn-sm" href="/studyonline/frontend/pages/teacher/quiz-questions.html?quiz_id=${q.id}">Câu hỏi</a>
            <button class="s-btn s-btn-danger s-btn-sm" onclick="deleteQuiz(${q.id},${courseId||'null'})">Xóa</button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  window.deleteQuiz = async (id, cid) => {
    if (!confirm('Xóa quiz này?')) return;
    const r = await Api.deleteQuiz(id);
    if (r?.ok) initQuizList();
  };
}

// ── LÀM BÀI QUIZ ────────────────────────────────────────
async function initQuizShow() {
  if (!requireLogin()) return;
  const quizId  = getParam('id');
  const alertEl = document.getElementById('alertBox');
  const bodyEl  = document.getElementById('quizBody');
  const titleEl = document.getElementById('quizTitle');
  const formEl  = document.getElementById('quizForm');

  const [qRes, questionsRes] = await Promise.all([
    Api.getQuiz(Number(quizId)),
    Api.getQuestions(Number(quizId)),
  ]);

  const quiz      = qRes?.data?.data;
  const questions = questionsRes?.data?.data || [];

  if (!quiz) { bodyEl.innerHTML = `<div class="alert alert-danger">Không tìm thấy quiz.</div>`; return; }

  if (titleEl) titleEl.textContent = quiz.title;
  document.title = quiz.title + ' — StudyOnline';

  const subTitle = document.getElementById('quizSubtitle');
  if (subTitle) subTitle.textContent = `${questions.length} câu hỏi · ${quiz.course_title}`;

  if (!questions.length) {
    bodyEl.innerHTML = `<div class="empty-state"><div class="icon">📝</div><h3>Quiz chưa có câu hỏi</h3></div>`;
    formEl.style.display = 'none';
    return;
  }

  bodyEl.innerHTML = questions.map((q, i) => `
    <div class="question-card">
      <div class="question-num">Câu ${i + 1}</div>
      <div class="question-content">${q.content}</div>
      <ul class="option-list">
        ${['A','B','C','D'].map(k => `
          <li class="option-item">
            <input type="radio" name="answers[${q.id}]" id="q${q.id}_${k}" value="${k}" required>
            <label for="q${q.id}_${k}">
              <span class="option-key">${k}</span>
              ${q['option_' + k.toLowerCase()]}
            </label>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  document.getElementById('totalQuestions').textContent = questions.length;

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Đang chấm bài...';

    // Kiểm tra đã trả lời đủ chưa
    const unanswered = questions.filter(q =>
      !formEl.querySelector(`input[name="answers[${q.id}]"]:checked`)
    );
    if (unanswered.length > 0) {
      showAlert(alertEl, `⚠️ Bạn còn ${unanswered.length} câu chưa trả lời. Vui lòng hoàn thành trước khi nộp bài.`, 'warning');
      btn.disabled = false;
      btn.innerHTML = '🚀 Nộp bài';
      return;
    }

    const answers = {};
    questions.forEach(q => {
      const checked = formEl.querySelector(`input[name="answers[${q.id}]"]:checked`);
      if (checked) answers[q.id] = checked.value;
    });

    const res = await Api.submitQuiz(Number(quizId), answers);

    // Backend dùng array_merge nên data nằm ở root: { success, quiz, score, total, percent, details }
    if (res?.ok && res.data?.success) {
      localStorage.setItem('quiz_result', JSON.stringify(res.data));
      window.location.href = `/studyonline/frontend/pages/student/quiz-result.html?id=${quizId}`;
    } else {
      showAlert(alertEl, res?.data?.message || 'Có lỗi khi nộp bài. Vui lòng thử lại.');
      btn.disabled = false;
      btn.innerHTML = '🚀 Nộp bài';
    }
  });
}

// ── KẾT QUẢ QUIZ ────────────────────────────────────────
function initQuizResult() {
  const resultData = JSON.parse(localStorage.getItem('quiz_result') || 'null');
  if (!resultData) { window.location.href = '/studyonline/frontend/pages/quiz.html'; return; }
  localStorage.removeItem('quiz_result');

  const { quiz, score, total, percent, details } = resultData;

  document.title = `Kết quả: ${quiz.title}`;

  const circleEl  = document.getElementById('scoreCircle');
  const summaryEl = document.getElementById('scoreSummary');
  const detailEl  = document.getElementById('detailList');

  const color = percent >= 80 ? 'var(--s-success)' : percent >= 50 ? 'var(--s-warning)' : 'var(--s-danger)';

  if (circleEl) {
    circleEl.style.background = `conic-gradient(${color} ${percent * 3.6}deg, var(--s-surface-2) 0deg)`;
    circleEl.innerHTML = `<div class="q-score-circle-inner">
      <div style="font-size: 1.05rem; color: var(--s-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Kết quả</div>
      <span style="color:${color}; font-size: 4rem; line-height: 1; font-weight: 900;">${score}<span style="font-size: 2rem; font-weight: 700; color: var(--s-text-muted);">/${total}</span></span>
      <span style="font-size: 0.95rem; color: var(--s-text-muted); font-weight: 600; margin-top: 0.6rem; display: flex; align-items: center; gap: 0.5rem;">
        <span style="color: var(--s-success);">✓ ${score} Đúng</span>
        <span style="color: var(--s-border);">|</span>
        <span style="color: var(--s-danger);">✗ ${total - score} Sai</span>
      </span>
      <div style="font-size: 0.85rem; font-weight: 700; color: ${color}; margin-top: 0.6rem; background: ${color}10; padding: 0.25rem 0.75rem; border-radius: 20px;">
        Đạt ${percent}%
      </div>
    </div>`;
  }

  if (summaryEl) {
    summaryEl.innerHTML = `
      <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--s-text); margin-bottom: 0.25rem;">${quiz.title}</h2>
      <p style="color:var(--s-text-muted); margin-bottom:0.5rem;">${quiz.course_title}</p>
    `;
  }

  if (detailEl) {
    detailEl.innerHTML = details.map((d, i) => `
      <div class="question-card">
        <div class="question-num">
          <span>Câu ${i + 1}</span>
          <span class="s-badge ${d.is_right ? 's-badge-green' : 's-badge-warn'}" style="text-transform: none; letter-spacing: normal;">
            ${d.is_right ? '✓ Đúng' : '✗ Sai'}
          </span>
        </div>
        <div class="question-content">${d.content}</div>
        <ul class="option-list">
          ${['A','B','C','D'].map(k => {
            let cls = '';
            let suffix = '';
            if (k === d.correct_answer) {
              cls = 'option-correct';
              if (k === d.chosen) {
                suffix = '<span class="s-badge s-badge-green" style="margin-left: auto; font-size: 0.7rem; text-transform: none; letter-spacing: normal; padding: 0.15rem 0.5rem;">Bạn chọn</span>';
              }
            } else if (k === d.chosen && !d.is_right) {
              cls = 'option-wrong';
              suffix = '<span class="s-badge s-badge-warn" style="margin-left: auto; font-size: 0.7rem; text-transform: none; letter-spacing: normal; padding: 0.15rem 0.5rem; color: var(--s-danger); background: rgba(239, 68, 68, 0.1);">Bạn chọn</span>';
            }
            return `
              <li class="option-item ${cls}">
                <span class="option-key">${k}</span>
                <span class="option-text">${d['option_' + k.toLowerCase()]}</span>
                ${suffix}
              </li>`;
          }).join('')}
        </ul>
      </div>
    `).join('');
  }
}

// ── QUẢN LÝ QUIZ (CRUD) ─────────────────────────────────
async function initQuizManage() {
  if (!requireLogin()) return;
  const user = Api.getUser();
  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    window.location.href = '/studyonline/frontend/pages/student/dashboard.html'; return;
  }

  const courseId  = getParam('course_id');
  const listEl    = document.getElementById('quizList');
  const alertEl   = document.getElementById('alertBox');
  const modalEl   = document.getElementById('quizModal');
  const formEl    = document.getElementById('quizForm');
  const coursesSel = document.getElementById('courseSelect');

  let editingId = null;

  // Load courses for select
  const cr = await Api.getCourses();
  const courses = cr?.data?.data || [];
  if (coursesSel) {
    coursesSel.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    if (courseId) coursesSel.value = courseId;
  }

  async function loadQuizzes() {
    listEl.innerHTML = `<div class="loading-page"><div class="spinner"></div></div>`;
    const res    = await Api.getQuizzes(courseId);
    const quizzes = res?.data?.data || [];

    if (!quizzes.length) {
      listEl.innerHTML = `<div class="s-empty"><div class="icon">📝</div><h3>Chưa có quiz nào</h3></div>`;
      return;
    }

    listEl.innerHTML = quizzes.map(q => `
      <div class="s-card" style="margin-bottom:.75rem;">
        <div class="s-card-body" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
          <div>
            <strong style="font-weight:700;color:var(--s-text);">${q.title}</strong>
            <span class="s-badge s-badge-blue" style="margin-left:.5rem;">${q.question_count} câu</span>
            <p style="font-size:.8rem;color:var(--s-text-muted);margin-top:.25rem;">${q.description||''}</p>
          </div>
          <div style="display:flex;gap:.5rem;">
            <a class="s-btn s-btn-outline s-btn-sm" href="/studyonline/frontend/pages/teacher/quiz-questions.html?quiz_id=${q.id}">Câu hỏi</a>
            <button class="s-btn s-btn-sm" style="background:var(--s-surface-2);" onclick="editQuiz(${q.id},'${encodeURIComponent(q.title)}','${encodeURIComponent(q.description||'')}',${q.course_id})">Sửa</button>
            <button class="s-btn s-btn-danger s-btn-sm" onclick="deleteQuiz(${q.id})">Xóa</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('addQuizBtn')?.addEventListener('click', () => {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Thêm quiz';
    formEl.title.value = ''; formEl.description.value = '';
    modalEl.style.display = 'flex';
  });

  document.getElementById('closeModal')?.addEventListener('click', () => modalEl.style.display = 'none');
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) modalEl.style.display = 'none'; });

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;
    const payload = {
      course_id:   Number(coursesSel?.value || courseId),
      title:       formEl.title.value.trim(),
      description: formEl.description.value.trim(),
    };
    const res = editingId ? await Api.updateQuiz({ id: editingId, ...payload }) : await Api.createQuiz(payload);
    btn.disabled = false;
    if (res?.ok && res.data?.success) { modalEl.style.display = 'none'; showAlert(alertEl, 'Thành công!', 'success'); loadQuizzes(); }
    else showAlert(alertEl, res?.data?.message || 'Lỗi.');
  });

  window.editQuiz = (id, title, desc, cid) => {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Sửa quiz';
    formEl.title.value = decodeURIComponent(title);
    formEl.description.value = decodeURIComponent(desc);
    if (coursesSel) coursesSel.value = cid;
    modalEl.style.display = 'flex';
  };

  window.deleteQuiz = async (id) => {
    if (!confirm('Xóa quiz này?')) return;
    const r = await Api.deleteQuiz(id);
    if (r?.ok) { showAlert(alertEl, 'Đã xóa!', 'success'); loadQuizzes(); }
  };

  loadQuizzes();
}

// ── QUẢN LÝ CÂU HỎI ─────────────────────────────────────
async function initQuizQuestions() {
  if (!requireLogin()) return;
  const user = Api.getUser();
  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    window.location.href = '/studyonline/frontend/pages/student/dashboard.html'; return;
  }

  const quizId  = getParam('quiz_id');
  if (!quizId) { window.location.href = '/studyonline/frontend/pages/quiz.html'; return; }

  const alertEl   = document.getElementById('alertBox');
  const listEl    = document.getElementById('questionList');
  const modalEl   = document.getElementById('questionModal');
  const formEl    = document.getElementById('questionForm');

  const qr = await Api.getQuiz(Number(quizId));
  const quiz = qr?.data?.data;
  if (quiz) {
    const titleEl = document.getElementById('quizTitle');
    if (titleEl) titleEl.textContent = quiz.title;
  }

  let editingId = null;

  async function loadQuestions() {
    listEl.innerHTML = `<div class="loading-page"><div class="spinner"></div></div>`;
    const res       = await Api.getQuestions(Number(quizId));
    const questions = res?.data?.data || [];

    if (!questions.length) {
      listEl.innerHTML = `<div class="s-empty"><div class="icon">❓</div><h3>Chưa có câu hỏi nào</h3></div>`;
      return;
    }

    listEl.innerHTML = questions.map((q, i) => {
      const optionsHtml = ['A', 'B', 'C', 'D'].map(k => {
        const text = q['option_' + k.toLowerCase()];
        if (!text && (k === 'C' || k === 'D')) return '';
        const isCorrect = k === q.correct_answer;
        return `
          <div class="option-item ${isCorrect ? 'correct' : ''}">
            <span class="option-icon">${isCorrect ? '✅' : '⬜'}</span>
            <span><strong>${k}.</strong> ${text}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="question-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1.5rem; flex-wrap:wrap;">
            <div style="flex:1;">
              <div class="question-num">Câu hỏi ${i + 1}</div>
              <div class="question-content">${q.content}</div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:0.75rem; margin-top:1.25rem;">
                ${optionsHtml}
              </div>
            </div>
            <div style="display:flex; gap:0.5rem; flex-shrink:0;">
              <button class="btn btn-outline btn-sm" onclick="editQuestion(${q.id})">✏️ Sửa</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="deleteQuestion(${q.id})">✕ Xóa</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('addQuestionBtn')?.addEventListener('click', () => {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Thêm câu hỏi';
    formEl.reset();
    modalEl.style.display = 'flex';
  });

  document.getElementById('closeModal')?.addEventListener('click', () => modalEl.style.display = 'none');
  modalEl?.addEventListener('click', e => { if (e.target === modalEl) modalEl.style.display = 'none'; });

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('button[type=submit]');
    btn.disabled = true;
    const payload = {
      quiz_id:       Number(quizId),
      content:       formEl.content.value.trim(),
      option_a:      formEl.option_a.value.trim(),
      option_b:      formEl.option_b.value.trim(),
      option_c:      formEl.option_c.value.trim(),
      option_d:      formEl.option_d.value.trim(),
      correct_answer: formEl.correct_answer.value,
      order_index:   Number(formEl.order_index?.value || 0),
    };
    const res = editingId ? await Api.updateQuestion({ id: editingId, ...payload }) : await Api.createQuestion(payload);
    btn.disabled = false;
    if (res?.ok && res.data?.success) { modalEl.style.display = 'none'; showAlert(alertEl, 'Thành công!', 'success'); loadQuestions(); }
    else showAlert(alertEl, res?.data?.message || 'Lỗi.');
  });

  window.editQuestion = async (id) => {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Sửa câu hỏi';
    const r = await Api.getQuestion(id);
    if (!r?.ok) return;
    const q = r.data.data;
    formEl.content.value        = q.content;
    formEl.option_a.value       = q.option_a;
    formEl.option_b.value       = q.option_b;
    formEl.option_c.value       = q.option_c;
    formEl.option_d.value       = q.option_d;
    formEl.correct_answer.value = q.correct_answer;
    if (formEl.order_index) formEl.order_index.value = q.order_index;
    modalEl.style.display = 'flex';
  };

  window.deleteQuestion = async (id) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    const r = await Api.deleteQuestion(id);
    if (r?.ok) { showAlert(alertEl, 'Đã xóa!', 'success'); loadQuestions(); }
  };

  loadQuestions();
}
