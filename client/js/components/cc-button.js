class CcButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const variant = this.getAttribute('variant') || 'primary';
    const type = this.getAttribute('type') || 'button';
    const disabled = this.hasAttribute('disabled') ? 'disabled' : '';

    this.shadowRoot.innerHTML = `
      <style>
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-family);
          font-size: var(--font-size-base);
          font-weight: 500;
          padding: var(--spacing-2) var(--spacing-4);
          border-radius: var(--border-radius-md);
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
          outline: none;
        }
        button:focus-visible {
          box-shadow: 0 0 0 2px var(--color-bg-primary), 0 0 0 4px var(--color-accent);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Variants */
        .primary {
          background-color: var(--color-accent);
          color: white;
        }
        .primary:hover:not(:disabled) {
          background-color: var(--color-accent-hover);
        }

        .secondary {
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
          border-color: var(--color-border);
        }
        .secondary:hover:not(:disabled) {
          background-color: var(--color-bg-secondary);
        }

        .ghost {
          background-color: transparent;
          color: var(--color-accent);
        }
        .ghost:hover:not(:disabled) {
          background-color: var(--color-bg-secondary);
        }
      </style>
      <button type="${type}" class="${variant}" ${disabled}>
        <slot></slot>
      </button>
    `;

    // Forward click to form submission if type is submit and inside a form
    if (type === 'submit') {
      this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
        const form = this.closest('form');
        if (form) {
          e.preventDefault();
          const event = new Event('submit', { cancelable: true, bubbles: true });
          form.dispatchEvent(event);
        }
      });
    }
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled' && this.shadowRoot) {
      const btn = this.shadowRoot.querySelector('button');
      if (btn) {
        if (newValue !== null) {
          btn.setAttribute('disabled', 'disabled');
        } else {
          btn.removeAttribute('disabled');
        }
      }
    }
  }
}

customElements.define('cc-button', CcButton);
