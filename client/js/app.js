import './components/cc-button.js';
import './components/cc-input.js';
import './components/cc-card.js';
import { loadLoginView, loadSignupView } from './views/auth.js';
import { loadCitizenReportView } from './views/citizen.js';
import { loadAdminDashboardView } from './views/admin.js';
import { loadWorkerTasksView } from './views/worker.js';

// New layout and views
import { renderAppLayout, updateSidebarActiveState } from './views/layout.js';
import { loadDashboardView } from './views/dashboard.js';
import { loadReportsView } from './views/reports.js';
import { loadMapView } from './views/map.js';
import { loadRewardsView } from './views/rewards.js';
import { loadStatisticsView } from './views/statistics.js';
import { loadSettingsView } from './views/settings.js';
import { loadAccountView } from './views/account.js';
import { request } from './api.js';

const appDiv = document.getElementById('app');

const publicRoutes = {
  '#/login': loadLoginView,
  '#/signup': loadSignupView,
};

const authenticatedRoutes = {
  '#/dashboard': loadDashboardView,
  '#/citizen/report': loadCitizenReportView,
  '#/reports': loadReportsView,
  '#/map': loadMapView,
  '#/rewards': loadRewardsView,
  '#/statistics': loadStatisticsView,
  '#/settings': loadSettingsView,
  '#/account': loadAccountView,
  // Legacy paths to keep compatibility
  '#/admin/dashboard': loadAdminDashboardView,
  '#/worker/tasks': loadWorkerTasksView,
};

let currentUser = null;
let isLayoutRendered = false;

async function navigate() {
  let hash = window.location.hash || '#/dashboard';
  
  if (hash === '#/') {
    hash = '#/dashboard';
    window.location.hash = hash;
    return;
  }

  const isPublicRoute = Object.keys(publicRoutes).includes(hash);

  if (!isPublicRoute && !currentUser) {
    try {
      const res = await request('/auth/me');
      currentUser = res.user;
    } catch (err) {
      window.location.hash = '#/login';
      return;
    }
  } else if (isPublicRoute) {
    currentUser = null;
    isLayoutRendered = false;
  }

  const performRender = (targetEl) => {
    if (isPublicRoute) {
      const renderFn = publicRoutes[hash] || loadLoginView;
      renderFn(targetEl);
    } else {
      if (!isLayoutRendered) {
        renderAppLayout(appDiv, currentUser);
        isLayoutRendered = true;
      }
      updateSidebarActiveState(hash);
      const mainContent = document.getElementById('main-content');
      const renderFn = authenticatedRoutes[hash] || loadDashboardView;
      renderFn(mainContent, currentUser);
    }
  };

  if (!document.startViewTransition) {
    performRender(appDiv);
  } else {
    document.startViewTransition(() => performRender(appDiv));
  }
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', navigate);

// Setup offline service worker (stub)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('SW registered');
  }).catch(err => {
    console.log('SW registration failed:', err);
  });
}
