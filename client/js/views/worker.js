import { request } from '../api.js';

export function loadWorkerTasksView(container) {
  container.innerHTML = `
    <div class="container" style="max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-6);">
        <h2>Today's Tasks</h2>
        <cc-button id="logout-btn" variant="ghost">Logout</cc-button>
      </div>
      
      <!-- Live location tracking switch -->
      <cc-card style="margin-bottom: var(--spacing-4); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin-bottom: var(--spacing-1);">Live Location Sharing</h3>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Allow dispatch to see your location while on duty.</p>
        </div>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="location-toggle" style="width: 20px; height: 20px;" />
          <span style="margin-left: var(--spacing-2); font-weight: 500;">On Duty</span>
        </label>
      </cc-card>
      
      <div id="tasks-list">Loading...</div>
    </div>
  `;

  let locationInterval;
  const wsUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';
  const ws = new WebSocket(wsUrl);

  container.querySelector('#location-toggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      if ('geolocation' in navigator) {
        locationInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition((pos) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'worker_location',
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }));
            }
          });
        }, 15000);
      }
    } else {
      clearInterval(locationInterval);
    }
  });

  async function loadTasks() {
    try {
      const { complaints } = await request('/complaints');
      const list = container.querySelector('#tasks-list');
      
      if (complaints.length === 0) {
        list.innerHTML = '<p class="text-center">No tasks assigned to you right now.</p>';
        return;
      }
      
      list.innerHTML = complaints.map(c => `
        <cc-card style="margin-bottom: var(--spacing-4);">
          <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-2);">
            <div style="font-weight: 600; font-size: 1.1rem;">${c.category}</div>
            <div style="background: ${c.severity === 'high' ? 'var(--color-status-danger)' : 'var(--color-status-warning)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${c.severity.toUpperCase()}</div>
          </div>
          <p style="margin-bottom: var(--spacing-2);">${c.description || 'No description'}</p>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--spacing-4);">
            📍 ${c.address || 'Location on map'}
          </div>
          <div style="display: flex; gap: var(--spacing-2);">
            ${c.status !== 'resolved' ? `
              <cc-button variant="primary" style="flex: 1;" onclick="updateTask('${c.id}', 'in_progress')">Start</cc-button>
              <cc-button variant="secondary" style="flex: 1;" onclick="updateTask('${c.id}', 'resolved')">Resolve</cc-button>
            ` : `
              <div style="color: var(--color-status-success); font-weight: 500;">✓ Resolved</div>
            `}
          </div>
        </cc-card>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // Bind globally for inline onclick
  window.updateTask = async (id, status) => {
    try {
      await request(`/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      loadTasks();
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  loadTasks();

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    clearInterval(locationInterval);
    await request('/auth/logout', { method: 'POST' });
    window.location.hash = '#/login';
  });
}
