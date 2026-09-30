class CcCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background-color: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-4);
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition-fast);
        }
        .card:hover {
          box-shadow: var(--shadow-md);
        }
      </style>
      <div class="card">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('cc-card', CcCard);
