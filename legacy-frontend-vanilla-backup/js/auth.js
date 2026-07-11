// auth.js — Xử lý login và register

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // ── LOGIN ──────────────────────────────────────────────
  if (loginForm) {
    redirectIfLoggedIn();
    const alertEl = document.getElementById('alertBox');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang xử lý...';

      try {
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        const res = await Api.login(email, password);

        if (res?.ok && res.data?.success) {
          Api.setAuth(res.data.token, res.data.user);
          const role = res.data.user?.role;
          if (role === 'admin') {
            window.location.href = '/studyonline/frontend/pages/admin/dashboard.html';
          } else if (role === 'teacher') {
            window.location.href = '/studyonline/frontend/pages/teacher/dashboard.html';
          } else {
            window.location.href = '/studyonline/frontend/pages/student/dashboard.html';
          }
        } else {
          showAlert(alertEl, res?.data?.message || 'Đăng nhập thất bại.');
          btn.disabled = false;
          btn.innerHTML = 'Đăng nhập';
        }
      } catch (err) {
        showAlert(alertEl, 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        btn.disabled = false;
        btn.innerHTML = 'Đăng nhập';
      }
    });
  }

  // ── REGISTER ───────────────────────────────────────────
  if (registerForm) {
    redirectIfLoggedIn();
    const alertEl = document.getElementById('alertBox');

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang xử lý...';

      try {
        const fullname = registerForm.fullname.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value.trim();
        const confirm_password = registerForm.confirm_password.value.trim();

        const res = await Api.register(fullname, email, password, confirm_password);

        if (res?.ok && res.data?.success) {
          showAlert(alertEl, 'Đăng ký thành công! Đang chuyển hướng...', 'success');
          setTimeout(() => window.location.href = '/studyonline/frontend/pages/login.html', 1500);
        } else {
          showAlert(alertEl, res?.data?.message || 'Đăng ký thất bại.');
          btn.disabled = false;
          btn.innerHTML = 'Đăng ký';
        }
      } catch (err) {
        showAlert(alertEl, 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        btn.disabled = false;
        btn.innerHTML = 'Đăng ký';
      }
    });
  }
});
