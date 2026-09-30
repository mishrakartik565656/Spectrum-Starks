export function loadRewardsView(container, user) {
  container.innerHTML = `
    <div class="rewards-page fade-in">
      <div class="empty-state" style="padding: var(--spacing-8) 0;">
        <span class="material-symbols-outlined empty-icon" style="font-size: 64px; color: var(--color-border); margin-bottom: var(--spacing-4);">military_tech</span>
        <h3 style="margin-bottom: var(--spacing-2);">Rewards coming soon</h3>
        <p class="text-secondary text-center" style="max-width: 400px; margin: 0 auto;">We are building an exciting new rewards system to thank you for keeping your city clean.</p>
      </div>
    </div>
  `;
}
