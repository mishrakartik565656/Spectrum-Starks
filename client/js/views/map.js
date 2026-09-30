export function loadMapView(container, user) {
  container.innerHTML = `
    <div class="map-page fade-in" style="display: flex; flex-direction: column; height: 100%;">
      <div class="empty-state" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <span class="material-symbols-outlined empty-icon" style="font-size: 64px; color: var(--color-border); margin-bottom: var(--spacing-4);">map</span>
        <h3 style="margin-bottom: var(--spacing-2);">Map coming soon</h3>
        <p class="text-secondary text-center">Interactive waste mapping features are currently under development.</p>
      </div>
    </div>
  `;
}
