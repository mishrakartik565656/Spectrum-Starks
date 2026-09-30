class CcInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'text';
    const placeholder = this.getAttribute('placeholder') || '';
    const name = this.getAttribute('name') || '';
    const label = this.getAttribute('label') || '';
    const required = this.hasAttribute('required') ? 'required' : '';
    const value = this.getAttribute('value') || '';

    this.shadowRoot.innerHTML = `
      <style>
        .wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
          margin-bottom: var(--spacing-4);
        }
        label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        input, textarea {
          font-family: var(--font-family);
          font-size: var(--font-size-base);
          padding: var(--spacing-2) var(--spacing-3);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
        }
        input:focus, textarea:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
        .error {
          color: var(--color-status-danger);
          font-size: var(--font-size-sm);
          display: none;
        }
      </style>
      <div class="wrapper">
        ${label ? `<label for="input">${label}</label>` : ''}
        ${type === 'textarea' 
          ? `<textarea id="input" name="${name}" placeholder="${placeholder}" ${required}>${value}</textarea>`
          : `<input id="input" type="${type}" name="${name}" placeholder="${placeholder}" value="${value}" ${required} />`
        }
        <div class="error" id="error-msg"></div>
      </div>
    `;
    
    // forward input event
    this.inputElement.addEventListener('input', (e) => {
      this.setAttribute('value', e.target.value);
      this.dispatchEvent(new CustomEvent('cc-input', { detail: e.target.value, bubbles: true }));
    });
  }

  get inputElement() {
    return this.shadowRoot.querySelector('#input');
  }

  get value() {
    return this.inputElement.value;
  }

  set value(val) {
    this.inputElement.value = val;
    this.setAttribute('value', val);
  }

  showError(msg) {
    const errorEl = this.shadowRoot.querySelector('#error-msg');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    this.inputElement.style.borderColor = 'var(--color-status-danger)';
  }

  clearError() {
    const errorEl = this.shadowRoot.querySelector('#error-msg');
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    this.inputElement.style.borderColor = 'var(--color-border)';
  }
}

customElements.define('cc-input', CcInput);
