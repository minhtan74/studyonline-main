/**
 * api.js — Fetch wrapper chung cho toàn bộ client
 * Tự động gắn Authorization: Bearer <token> vào header
 */

const BASE_URL = '/studyonline/backend/public';

const Api = {
  /** Lấy token từ localStorage */
  getToken() {
    return localStorage.getItem('token');
  },

  /** Lưu token + user vào localStorage */
  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /** Xóa token (logout) */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /** Lấy user hiện tại từ localStorage */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch { return null; }
  },

  /** Kiểm tra đã đăng nhập chưa */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Gọi API
   * @param {string} path   - Đường dẫn API, vd: '/api/auth/login'
   * @param {object} opts   - Các option (method, body, ...)
   */
  async request(path, opts = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      };

      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}${path}`, {
        method: opts.method || 'GET',
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });

      // Đọc response text trước, rồi parse JSON để tránh crash
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Server response không phải JSON:', text.slice(0, 300));
        return {
          ok: false,
          status: res.status,
          data: { success: false, message: `Lỗi máy chủ (${res.status}). Kiểm tra lại cấu hình PHP.` },
        };
      }

      // Token hết hạn → tự đăng xuất (chỉ khi không phải trang auth)
      if (res.status === 401 && !path.startsWith('/api/auth/')) {
        this.clearAuth();
        window.location.href = '/studyonline/frontend/pages/login.html';
        return;
      }

      return { ok: res.ok, status: res.status, data };

    } catch (err) {
      console.error('Fetch error:', err);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể kết nối tới máy chủ. Kiểm tra XAMPP đang chạy.' },
      };
    }
  },

  // ── Shortcuts ──────────────────────────────────────────
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body }); },
  put(path, body) { return this.request(path, { method: 'PUT', body }); },
  delete(path) { return this.request(path, { method: 'DELETE' }); },

  // ── Auth ───────────────────────────────────────────────
  login(email, password) {
    return this.post('/api/auth/login', { email, password });
  },
  register(fullname, email, password, confirm_password) {
    return this.post('/api/auth/register', { fullname, email, password, confirm_password });
  },
  logout() {
    return this.post('/api/auth/logout');
  },
  me() {
    return this.get('/api/auth/me');
  },

  // ── Courses ───────────────────────────────────────────
  getCourses() { return this.get('/api/courses'); },
  getCourse(id) { return this.get(`/api/courses?id=${id}`); },
  createCourse(data) { return this.post('/api/courses', data); },
  updateCourse(data) { return this.put('/api/courses', data); },
  deleteCourse(id) { return this.delete(`/api/courses?id=${id}`); },

  // ── Chapters ──────────────────────────────────────────
  getChapters(courseId) { return this.get(`/api/chapters?course_id=${courseId}`); },
  getChapter(id) { return this.get(`/api/chapters?id=${id}`); },
  createChapter(data) { return this.post('/api/chapters', data); },
  updateChapter(data) { return this.put('/api/chapters', data); },
  deleteChapter(id) { return this.delete(`/api/chapters?id=${id}`); },

  // ── Lessons ───────────────────────────────────────────
  getLessons(chapterId) { return this.get(`/api/lessons?chapter_id=${chapterId}`); },
  getLesson(id) { return this.get(`/api/lessons?id=${id}`); },
  createLesson(data) { return this.post('/api/lessons', data); },
  updateLesson(data) { return this.put('/api/lessons', data); },
  deleteLesson(id) { return this.delete(`/api/lessons?id=${id}`); },

  // ── Quizzes ───────────────────────────────────────────
  getQuizzes(courseId) { return courseId ? this.get(`/api/quizzes?course_id=${courseId}`) : this.get('/api/quizzes'); },
  getQuiz(id) { return this.get(`/api/quizzes?id=${id}`); },
  createQuiz(data) { return this.post('/api/quizzes', data); },
  updateQuiz(data) { return this.put('/api/quizzes', data); },
  deleteQuiz(id) { return this.delete(`/api/quizzes?id=${id}`); },

  // ── Questions ─────────────────────────────────────────
  getQuestions(quizId) { return this.get(`/api/quizzes/questions?quiz_id=${quizId}`); },
  getQuestion(id) { return this.get(`/api/quizzes/questions?id=${id}`); },
  createQuestion(data) { return this.post('/api/quizzes/questions', data); },
  updateQuestion(data) { return this.put('/api/quizzes/questions', data); },
  deleteQuestion(id) { return this.delete(`/api/quizzes/questions?id=${id}`); },

  // ── Submit Quiz ───────────────────────────────────────
  submitQuiz(quizId, answers) {
    return this.post('/api/quizzes/submit', { quiz_id: quizId, answers });
  },

  // ── Users Management ───────────────────────────────────
  getUsers()         { return this.get('/api/users'); },
  getUserById(id)    { return this.get(`/api/users?id=${id}`); },
  createUser(data)   { return this.post('/api/users', data); },
  updateUser(data)   { return this.put('/api/users', data); },
  deleteUser(id)     { return this.delete(`/api/users?id=${id}`); },

  // ── Enrollments ────────────────────────────────────────
  getEnrollments()        { return this.get('/api/enrollments'); },
  getEnrolledIds()        { return this.get('/api/enrollments?ids_only=1'); },
  checkEnrolled(courseId) { return this.get(`/api/enrollments?course_id=${courseId}`); },
  enroll(courseId)        { return this.post('/api/enrollments', { course_id: courseId }); },
  unenroll(courseId)      { return this.delete(`/api/enrollments?course_id=${courseId}`); },

  // ── Payments ───────────────────────────────────────────
  getPayments()           { return this.get('/api/payments'); },
  checkPayment(courseId)  { return this.get(`/api/payments/check?course_id=${courseId}`); },
  pay(courseId, method, cardData = {}) {
    return this.post('/api/payments', { course_id: courseId, method, ...cardData });
  },

  // ── Progress ───────────────────────────────────────────
  /** Lấy tổng hợp tiến độ tất cả khóa học + stats */
  getProgress()            { return this.get('/api/progress'); },
  /** Lấy danh sách lesson_id đã hoàn thành trong 1 khóa */
  getProgressByCourse(courseId) { return this.get(`/api/progress?course_id=${courseId}`); },
  /** Lấy dữ liệu biểu đồ theo tuần (7 ngày gần nhất) */
  getWeeklyProgress()      { return this.get('/api/progress?weekly=1'); },
  /** Cập nhật tiến độ 1 bài học */
  updateProgress(lessonId, watchedSec, isCompleted) {
    return this.post('/api/progress', { lesson_id: lessonId, watched_sec: watchedSec, is_completed: isCompleted });
  },
};

// ── Helpers UI ──────────────────────────────────────────

/**
 * Render navbar dựa trên trạng thái đăng nhập
 */
function renderNavbar() {
  const user = Api.getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const role = user?.role;
  let panelLink = '';
  if (role === 'admin') {
    panelLink = `<li><a class="nav-link" href="/studyonline/frontend/pages/admin/dashboard.html">Admin Panel</a></li>`;
  } else if (role === 'teacher') {
    panelLink = `<li><a class="nav-link" href="/studyonline/frontend/pages/teacher/dashboard.html">Teacher Panel</a></li>`;
  } else if (role === 'student') {
    panelLink = `<li><a class="nav-link" href="/studyonline/frontend/pages/student/dashboard.html">Dashboard</a></li>`;
  }

  nav.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 1.5rem;">
      <div style="display:flex;align-items:center;gap:0.25rem;">
        <a class="navbar-brand" href="/studyonline/frontend/pages/home.html">
          🎓 <span>StudyOnline</span>
        </a>
        <a class="nav-link" href="/studyonline/frontend/pages/home.html">Trang chủ</a>
      </div>
      <ul class="navbar-nav" style="flex-direction:row;">
        ${panelLink}
        ${user ? `
          <li>
            <button class="btn btn-outline btn-sm" onclick="doLogout()">
              Đăng xuất (${user.fullname.split(' ').pop()})
            </button>
          </li>
        ` : `
          <li><a class="btn btn-outline btn-sm" href="/studyonline/frontend/pages/login.html">Đăng nhập</a></li>
          <li><a class="btn btn-primary btn-sm" href="/studyonline/frontend/pages/register.html">Đăng ký</a></li>
        `}
      </ul>
    </div>
  `;
}

function doLogout() {
  try {
    Api.clearAuth();
    Api.logout();
  } catch (e) {
    console.error(e);
  }
  window.location.href = '/studyonline/frontend/pages/home.html';
}

/** Chuyển hướng nếu chưa đăng nhập */
function requireLogin() {
  if (!Api.isLoggedIn()) {
    window.location.href = '/studyonline/frontend/pages/login.html';
    return false;
  }
  return true;
}

/** Chuyển hướng nếu đã đăng nhập — admin về trang admin */
function redirectIfLoggedIn() {
  if (!Api.isLoggedIn()) return;
  const user = Api.getUser();
  if (user?.role === 'admin') {
    window.location.href = '/studyonline/frontend/pages/admin/dashboard.html';
  } else if (user?.role === 'teacher') {
    window.location.href = '/studyonline/frontend/pages/teacher/dashboard.html';
  } else {
    window.location.href = '/studyonline/frontend/pages/student/dashboard.html';
  }
}

/** Helper: lấy query param */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Helper: hiển thị alert */
function showAlert(el, message, type = 'danger') {
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}
