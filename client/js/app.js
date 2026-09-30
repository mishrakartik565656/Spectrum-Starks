// Simple hash-based router and app entry point
import './components/cc-button.js';
import './components/cc-input.js';
import './components/cc-card.js';
import { loadLoginView, loadSignupView } from './views/auth.js';
import { loadCitizenReportView } from './views/citizen.js';
import { loadAdminDashboardView } from './views/admin.js';
import { loadWorkerTasksView } from './views/worker.js';

const appDiv = document.getElementById('app');

const routes = {
  '#/login': loadLoginView,
  '#/signup': loadSignupView,
  '#/citizen/report': loadCitizenReportView,
  '#/admin/dashboard': loadAdminDashboardView,
  '#/worker/tasks': loadWorkerTasksView,
};

async function navigate() {
  let hash = window.location.hash;
  if (!hash) {
    hash = '#/login';
    window.location.hash = hash;
    return;
  }

  const renderFn = routes[hash] || loadLoginView;
  
  if (!document.startViewTransition) {
    renderFn(appDiv);
  } else {
    document.startViewTransition(() => renderFn(appDiv));
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
