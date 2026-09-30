import { request } from '../api.js';

export async function loadStatisticsView(container, user) {
  container.innerHTML = `
    <div class="statistics-page fade-in">
      <div id="stats-content">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Analyzing data...</p>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await request('/complaints');
    const reports = Array.isArray(data) ? data : (data.complaints || []);
    
    if (reports.length === 0) {
      container.querySelector('#stats-content').innerHTML = `
        <div class="empty-state" style="padding: var(--spacing-8) 0;">
          <span class="material-symbols-outlined empty-icon" style="font-size: 64px; color: var(--color-border); margin-bottom: var(--spacing-4);">analytics</span>
          <h3 style="margin-bottom: var(--spacing-2);">Not enough data</h3>
          <p class="text-secondary text-center">There isn't enough report data yet to generate statistics.</p>
        </div>
      `;
      return;
    }

    // Basic stats calculation based on existing real data
    const total = reports.length;
    const categories = {};
    reports.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });

    const mostCommonCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, '');

    container.querySelector('#stats-content').innerHTML = `
      <div class="stats-overview-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-4);">
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; padding: var(--spacing-6);">
          <p class="text-secondary mb-2">Most Reported Issue</p>
          <h3 style="color: var(--color-accent); font-size: 1.5rem;">${mostCommonCategory || 'N/A'}</h3>
        </div>
        <div class="stat-card" style="flex-direction: column; align-items: flex-start; justify-content: center; padding: var(--spacing-6);">
          <p class="text-secondary mb-2">Resolution Rate</p>
          <h3 style="color: var(--color-status-success); font-size: 1.5rem;">
            ${Math.round((reports.filter(r => r.status === 'resolved').length / total) * 100) || 0}%
          </h3>
        </div>
      </div>
      
      <div class="card" style="padding: var(--spacing-6); background: white; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm);">
        <h3 class="mb-4">Reports by Category</h3>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
          ${Object.entries(categories).map(([cat, count]) => `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-1);">
                <span>${cat}</span>
                <strong>${count}</strong>
              </div>
              <div style="width: 100%; background: var(--color-border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="width: ${(count / total) * 100}%; background: var(--color-accent); height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.querySelector('#stats-content').innerHTML = `
      <div class="error-state">
        <p>Failed to load statistics.</p>
      </div>
    `;
  }
}
