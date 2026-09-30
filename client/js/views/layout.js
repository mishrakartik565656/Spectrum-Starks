import { request } from '../api.js';

export function renderAppLayout(container, user) {
  container.innerHTML = `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="logo-placeholder"></div>
          <h1 class="brand-name">CleanCity</h1>
        </div>
        
        <nav class="sidebar-nav">
          <a href="#/dashboard" class="nav-item" data-route="#/dashboard">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a href="#/citizen/report" class="nav-item" data-route="#/citizen/report">
            <span class="material-symbols-outlined">add_circle</span>
            Report Waste
          </a>
          <a href="#/reports" class="nav-item" data-route="#/reports">
            <span class="material-symbols-outlined">list_alt</span>
            My Reports
          </a>
          <a href="#/map" class="nav-item" data-route="#/map">
            <span class="material-symbols-outlined">map</span>
            Map
          </a>
          <a href="#/rewards" class="nav-item" data-route="#/rewards">
            <span class="material-symbols-outlined">star</span>
            Rewards
          </a>
          <a href="#/statistics" class="nav-item" data-route="#/statistics">
            <span class="material-symbols-outlined">bar_chart</span>
            Statistics
          </a>
          <div class="nav-divider"></div>
          <a href="#/settings" class="nav-item" data-route="#/settings">
            <span class="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a href="#/account" class="nav-item" data-route="#/account">
            <span class="material-symbols-outlined">person</span>
            Account
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <a href="#" id="logout-btn" class="nav-item">
            <span class="material-symbols-outlined">logout</span>
            Logout
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" id="mobile-menu-btn">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <h2 class="page-title" id="topbar-title">Dashboard</h2>
          </div>
          <div class="topbar-right">
            <button class="icon-btn">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <div class="user-menu">
              <div class="avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <span class="user-name">${user.name || 'User'}</span>
            </div>
          </div>
        </header>

        <!-- Dynamic View Container -->
        <main id="main-content" class="main-content"></main>

        <!-- Watermark -->
        <div class="starks-watermark">Made by Starks</div>
      </div>
    </div>
  `;

  // Event Listeners
  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await request('/auth/logout', { method: 'POST' });
        window.location.hash = '#/login';
      } catch (err) {
        alert('Logout failed: ' + err.message);
      }
    });
  }

  const mobileMenuBtn = container.querySelector('#mobile-menu-btn');
  const sidebar = container.querySelector('#app-sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar on mobile when nav item clicked
  const navItems = container.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    });
  });
}

export function updateSidebarActiveState(hash) {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  let title = 'Dashboard';
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-route') === hash) {
      item.classList.add('active');
      title = item.textContent.trim();
    }
  });

  const titleEl = document.getElementById('topbar-title');
  if (titleEl) {
    titleEl.textContent = title;
  }
}
