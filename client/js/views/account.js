export function loadAccountView(container, user) {
  container.innerHTML = `
    <div class="account-page fade-in">
      <div class="account-header">
        <div class="account-avatar-large">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <div>
          <h2 class="mb-1">${user.name || 'User'}</h2>
          <p class="text-secondary">${user.email}</p>
          <span class="role-badge mt-2">${(user.role || 'Citizen').toUpperCase()}</span>
        </div>
      </div>
      
      <div class="card mt-4" style="padding: var(--spacing-6); background: white; border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm);">
        <div class="tabs mb-4">
          <button class="tab-btn active">Profile Details</button>
        </div>
        
        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">Full Name</span>
            <span class="detail-value">${user.name || 'Not provided'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email Address</span>
            <span class="detail-value">${user.email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Account Role</span>
            <span class="detail-value" style="text-transform: capitalize;">${user.role || 'Citizen'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Member Since</span>
            <span class="detail-value">Just now</span> <!-- Placeholder as real data isn't in token/API -->
          </div>
        </div>
      </div>
    </div>
  `;
}
