import { request } from '../api.js';

export async function loadReportsView(container, user) {
  container.innerHTML = `
    <div class="reports-page fade-in">
      <div class="tabs mb-4">
        <button class="tab-btn active" data-filter="all">All</button>
        <button class="tab-btn" data-filter="pending">Pending</button>
        <button class="tab-btn" data-filter="in_progress">In Progress</button>
        <button class="tab-btn" data-filter="resolved">Resolved</button>
      </div>
      
      <div id="reports-list" class="reports-list full-width">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading your reports...</p>
        </div>
      </div>
    </div>
  `;

  let allReports = [];

  const renderReports = (filter) => {
    const list = container.querySelector('#reports-list');
    const filtered = filter === 'all' ? allReports : allReports.filter(r => r.status.toLowerCase() === filter);
    
    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">inbox</span>
          <p>No reports found in this category.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(r => `
      <div class="report-card">
        <div class="report-header">
          <div class="report-category">
            <span class="material-symbols-outlined">delete</span>
            <strong>${r.category}</strong>
          </div>
          <span class="status-badge status-${r.status.toLowerCase()}">${r.status.toUpperCase()}</span>
        </div>
        <div class="report-body">
          ${r.description ? `<p class="report-desc">"${r.description}"</p>` : ''}
          <p class="report-location"><span class="material-symbols-outlined">location_on</span> ${r.address || 'Location provided'}</p>
        </div>
        <div class="report-footer">
          <span class="report-id">ID: #${r.id}</span>
          <span class="report-date">${new Date(r.createdAt).toLocaleString()}</span>
        </div>
      </div>
    `).join('');
  };

  try {
    const data = await request('/complaints');
    allReports = Array.isArray(data) ? data : (data.complaints || []);
    renderReports('all');
  } catch (err) {
    container.querySelector('#reports-list').innerHTML = `
      <div class="error-state">
        <p>Failed to load reports. Please try again.</p>
      </div>
    `;
  }

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderReports(e.target.getAttribute('data-filter'));
    });
  });
}
