export function loadSettingsView(container, user) {
  container.innerHTML = `
    <div class="settings-page fade-in">
      <div class="settings-container">
        <div class="card settings-card" style="padding: var(--spacing-6); background: white; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); margin-bottom: var(--spacing-4);">
          <h3 class="mb-4 flex items-center gap-2"><span class="material-symbols-outlined">palette</span> Appearance</h3>
          
          <div class="setting-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-4) 0; border-bottom: 1px solid var(--color-border);">
            <div>
              <strong>Dark Mode</strong>
              <p class="text-secondary" style="font-size: var(--font-size-sm); margin-top: 4px;">Use a darker theme for the dashboard</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="dark-mode-toggle">
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <div class="card settings-card" style="padding: var(--spacing-6); background: white; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm);">
          <h3 class="mb-4 flex items-center gap-2"><span class="material-symbols-outlined">notifications_active</span> Notifications</h3>
          
          <div class="setting-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-4) 0; border-bottom: 1px solid var(--color-border);">
            <div>
              <strong>Email Notifications</strong>
              <p class="text-secondary" style="font-size: var(--font-size-sm); margin-top: 4px;">Receive updates about your reports</p>
            </div>
            <label class="switch">
              <input type="checkbox" checked disabled>
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  // Note: True persistence of settings requires backend support. 
  // We'll just toggle a class for presentation on the frontend.
  const darkModeToggle = container.querySelector('#dark-mode-toggle');
  if (document.body.classList.contains('dark-theme')) {
    darkModeToggle.checked = true;
  }
  
  darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  });
}
