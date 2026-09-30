import { request } from '../api.js';

export async function loadDashboardView(container, user) {
  container.innerHTML = `
    <div class="dashboard-page fade-in">
      <div class="welcome-section">
        <h2>Welcome back, ${user.name || 'User'} 👋</h2>
        <p class="text-secondary">Help keep your city clean.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(59, 130, 246, 0.1); color: #3B82F6;">
            <span class="material-symbols-outlined">assignment</span>
          </div>
          <div class="stat-details">
            <h3 id="stat-total">-</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">
            <span class="material-symbols-outlined">pending_actions</span>
          </div>
          <div class="stat-details">
            <h3 id="stat-pending">-</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div class="stat-details">
            <h3 id="stat-resolved">-</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-reports-section">
          <div class="section-header flex items-center" style="justify-content: space-between; margin-bottom: var(--spacing-4);">
            <h3>Recent Reports</h3>
            <a href="#/reports" class="btn-link">View All</a>
          </div>
          <div id="recent-reports-container" class="reports-list">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading reports...</p>
            </div>
          </div>
        </div>

        <div class="quick-actions-section">
          <h3 style="margin-bottom: var(--spacing-4);">Quick Actions</h3>
          <div class="quick-actions-grid">
            <a href="#/citizen/report" class="action-card primary">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Report Waste</span>
            </a>
            <a href="#/map" class="action-card">
              <span class="material-symbols-outlined">map</span>
              <span>View Map</span>
            </a>
            <a href="#/rewards" class="action-card">
              <span class="material-symbols-outlined">star</span>
              <span>Rewards</span>
            </a>
            <a href="#/account" class="action-card">
              <span class="material-symbols-outlined">person</span>
              <span>Account</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await request('/complaints');
    const reports = Array.isArray(data) ? data : (data.complaints || []);
    
    // Calculate stats
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    
    container.querySelector('#stat-total').textContent = total;
    container.querySelector('#stat-pending').textContent = pending;
    container.querySelector('#stat-resolved').textContent = resolved;

    // Render recent reports
    const recent = reports.slice(0, 3);
    const reportsContainer = container.querySelector('#recent-reports-container');
    
    if (recent.length === 0) {
      reportsContainer.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">inbox</span>
          <p>No recent reports</p>
          <a href="#/citizen/report" class="btn btn-primary" style="margin-top: var(--spacing-2); display: inline-block;">Make a Report</a>
        </div>
      `;
    } else {
      reportsContainer.innerHTML = recent.map(r => `
        <div class="report-card-mini">
          <div class="report-info">
            <h4>${r.category}</h4>
            <p class="report-address">${r.address || 'Location provided'}</p>
            <span class="report-date">${new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="report-status status-${r.status.toLowerCase()}">
            ${r.status}
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    container.querySelector('#recent-reports-container').innerHTML = `
      <div class="error-state">
        <p>Failed to load reports.</p>
      </div>
    `;
  }
}
