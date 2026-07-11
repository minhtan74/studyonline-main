// student-dashboard.js — Sidebar toggle + shared logic cho student pages

(function () {
  /* ── Sidebar Toggle ── */
  function initSidebar() {
    const body    = document.body;
    const sidebar = document.getElementById('studentSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !toggleBtn) return;

    const COLLAPSED_KEY = 'sidebar_collapsed';
    if (localStorage.getItem(COLLAPSED_KEY) === '1') {
      body.classList.add('sidebar-collapsed');
      sidebar.classList.add('collapsed');
    }

    toggleBtn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar.classList.toggle('mobile-open');
        overlay && overlay.classList.toggle('active');
      } else {
        body.classList.toggle('sidebar-collapsed');
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem(COLLAPSED_KEY, isCollapsed ? '1' : '0');
      }
    });

    overlay && overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }

  /* ── Avatar Dropdown ── */
  function initAvatarDropdown() {
    const wrap = document.getElementById('avatarWrap');
    const dropdown = document.getElementById('avatarDropdown');
    if (!wrap || !dropdown) return;

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  /* ── Active Nav ── */
  function setActiveNav() {
    const current = window.location.pathname;
    document.querySelectorAll('.s-nav-item').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && current.endsWith(href.split('/').pop())) {
        link.classList.add('active');
      }
    });
  }

  /* ── Populate Header User ── */
  function populateUser() {
    const user = typeof Api !== 'undefined' ? Api.getUser() : null;
    if (!user) return;

    const avatarEl = document.getElementById('headerAvatar');
    const nameEl   = document.getElementById('headerName');

    const initials = user.fullname
      ? user.fullname.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
      : '??';

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = user.fullname?.split(' ').pop() || '';
  }

  /* ── Logout ── */
  window.studentLogout = function () {
    if (typeof Api !== 'undefined') {
      try {
        Api.clearAuth();
        Api.logout();
      } catch (e) {
        console.error(e);
      }
    }
    window.location.href = '/studyonline/frontend/pages/home.html';
  };

  /* ── Chart: Weekly Progress (Bar) ── */
  window.renderWeeklyChart = function (canvasId, data, labels) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [{
          label: 'Bài học hoàn thành',
          data: data || [2, 4, 3, 5, 2, 6, 1],
          backgroundColor: 'rgba(37,99,235,0.18)',
          borderColor: '#2563EB',
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  };

  /* ── Chart: Doughnut Progress ── */
  window.renderDoughnutChart = function (canvasId, completed, total) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || typeof Chart === 'undefined') return;
    const rem = Math.max(0, total - completed);
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành', 'Còn lại'],
        datasets: [{
          data: [completed, rem],
          backgroundColor: ['#2563EB', '#E2E8F0'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false } }
      }
    });
  };

  /* ── Init on DOM ready ── */
  document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initAvatarDropdown();
    setActiveNav();
    populateUser();
  });
})();
