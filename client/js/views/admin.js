import { request } from '../api.js';

export function loadAdminDashboardView(container) {
  container.innerHTML = `
    <div style="display: flex; height: 100vh;">
      <!-- Sidebar -->
      <div style="width: 250px; background: var(--color-bg-primary); border-right: 1px solid var(--color-border); padding: var(--spacing-4); display: flex; flex-direction: column;">
        <h2 style="color: var(--color-accent); margin-bottom: var(--spacing-6);">CleanCity Admin</h2>
        <nav style="display: flex; flex-direction: column; gap: var(--spacing-2);">
          <a href="#/admin/dashboard" style="padding: var(--spacing-2); border-radius: var(--border-radius-sm); background: rgba(22,163,74,0.1); color: var(--color-accent); font-weight: 500;">📊 Dashboard</a>
          <a href="#/admin/map" style="padding: var(--spacing-2); border-radius: var(--border-radius-sm); color: var(--color-text-primary);">🗺️ Live Map</a>
          <a href="#/admin/complaints" style="padding: var(--spacing-2); border-radius: var(--border-radius-sm); color: var(--color-text-primary);">📋 Complaints</a>
          <a href="#/admin/bins" style="padding: var(--spacing-2); border-radius: var(--border-radius-sm); color: var(--color-text-primary);">🗑️ Bins</a>
        </nav>
        <div style="margin-top: auto;">
          <cc-button id="logout-btn" variant="ghost" style="width: 100%;">Logout</cc-button>
        </div>
      </div>
      
      <!-- Main Content -->
      <div style="flex: 1; padding: var(--spacing-6); overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-6);">
          <h1>Dashboard Overview</h1>
          <div>
            <cc-button variant="secondary">Export Report</cc-button>
          </div>
        </div>
        
        <!-- KPIs -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4); margin-bottom: var(--spacing-6);">
          <cc-card>
            <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Open Complaints</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-status-warning);" id="kpi-open">-</div>
          </cc-card>
          <cc-card>
            <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">In Progress</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-status-info);" id="kpi-progress">-</div>
          </cc-card>
          <cc-card>
            <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Resolved</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-status-success);" id="kpi-resolved">-</div>
          </cc-card>
          <cc-card>
            <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Overflowing Bins</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-status-danger);" id="kpi-bins">-</div>
          </cc-card>
        </div>
        
        <!-- Activity & Map preview (Stubbed) -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-4);">
          <cc-card>
            <h3>Recent Complaints</h3>
            <div id="recent-list" style="margin-top: var(--spacing-4);">Loading...</div>
          </cc-card>
          <cc-card>
            <h3>Live Feed</h3>
            <div id="live-feed" style="margin-top: var(--spacing-4); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              Waiting for activity...
            </div>
          </cc-card>
        </div>
      </div>
    </div>
  `;

  // Fetch data
  async function loadData() {
    try {
      const [{ complaints }, { bins }] = await Promise.all([
        request('/complaints'),
        request('/bins')
      ]);
      
      const open = complaints.filter(c => c.status === 'submitted').length;
      const progress = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length;
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      const overflowing = bins.filter(b => b.isOverflowing).length;

      container.querySelector('#kpi-open').textContent = open;
      container.querySelector('#kpi-progress').textContent = progress;
      container.querySelector('#kpi-resolved').textContent = resolved;
      container.querySelector('#kpi-bins').textContent = overflowing;

      const recentList = container.querySelector('#recent-list');
      recentList.innerHTML = complaints.slice(0, 5).map(c => `
        <div style="padding: var(--spacing-2) 0; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between;">
          <div>
            <strong>${c.category}</strong>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${c.address || 'No address'}</div>
          </div>
          <div>
            <span style="background: var(--color-bg-secondary); padding: 2px 8px; border-radius: 12px; font-size: 12px;">${c.status}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  loadData();

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await request('/auth/logout', { method: 'POST' });
    window.location.hash = '#/login';
  });

  // Setup WebSocket for Live Feed
  const wsUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const feed = container.querySelector('#live-feed');
    const item = document.createElement('div');
    item.style.padding = 'var(--spacing-1) 0';
    item.style.borderBottom = '1px solid var(--color-border)';
    
    if (data.type === 'new_complaint') {
      item.innerHTML = `🚨 New report: ${data.complaint.category}`;
      loadData(); // refresh KPIs
    } else if (data.type === 'bin_alert') {
      item.innerHTML = `⚠️ Bin Overflow: ID ${data.binId} at ${data.fill}%`;
      loadData();
    } else {
      item.innerHTML = `ℹ️ Update received`;
    }
    
    feed.prepend(item);
  };
}
