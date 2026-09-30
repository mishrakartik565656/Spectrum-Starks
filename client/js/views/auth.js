import { request } from '../api.js';

export function loadLoginView(container) {
  container.innerHTML = `
    <div class="container flex items-center justify-center" style="min-height: 100vh;">
      <cc-card style="width: 100%; max-width: 400px; padding: var(--spacing-6);">
        <div class="text-center mb-4">
          <h2>CleanCity</h2>
          <p>Login to your account</p>
        </div>
        <form id="login-form">
          <cc-input type="email" id="email" label="Email" required placeholder="name@example.com"></cc-input>
          <cc-input type="password" id="password" label="Password" required placeholder="••••••••"></cc-input>
          <div class="mt-4">
            <cc-button type="submit" variant="primary" style="width: 100%">Log In</cc-button>
          </div>
        </form>
        <div class="text-center mt-4">
          <p style="font-size: var(--font-size-sm)">Don't have an account? <a href="#/signup">Create account</a></p>
        </div>
        <div class="mt-4 gap-2 flex justify-center" style="flex-wrap: wrap;">
          <cc-button variant="secondary" id="demo-citizen">Citizen</cc-button>
          <cc-button variant="secondary" id="demo-worker">Worker</cc-button>
          <cc-button variant="secondary" id="demo-admin">Admin</cc-button>
        </div>
      </cc-card>
    </div>
  `;

  // Demo chips
  container.querySelector('#demo-citizen').addEventListener('click', () => fillAndSubmit('citizen1@cleancity.com', 'password'));
  container.querySelector('#demo-worker').addEventListener('click', () => fillAndSubmit('worker1@cleancity.com', 'password'));
  container.querySelector('#demo-admin').addEventListener('click', () => fillAndSubmit('admin@cleancity.com', 'password'));

  function fillAndSubmit(email, password) {
    container.querySelector('#email').value = email;
    container.querySelector('#password').value = password;
    container.querySelector('#login-form').dispatchEvent(new Event('submit'));
  }

  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    try {
      const { user } = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'supervisor') {
        window.location.hash = '#/admin/dashboard';
      } else if (user.role === 'worker') {
        window.location.hash = '#/worker/tasks';
      } else {
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  });
}

export function loadSignupView(container) {
  container.innerHTML = `
    <div class="container flex items-center justify-center" style="min-height: 100vh;">
      <cc-card style="width: 100%; max-width: 400px; padding: var(--spacing-6);">
        <div class="text-center mb-4">
          <h2>CleanCity</h2>
          <p>Create a new account</p>
        </div>
        <form id="signup-form">
          <cc-input type="text" id="name" label="Full Name" required placeholder="John Doe"></cc-input>
          <cc-input type="email" id="email" label="Email" required placeholder="name@example.com"></cc-input>
          <cc-input type="password" id="password" label="Password" required placeholder="••••••••"></cc-input>
          <div class="mt-4">
            <cc-button type="submit" variant="primary" style="width: 100%">Create account</cc-button>
          </div>
        </form>
        <div class="text-center mt-4">
          <p style="font-size: var(--font-size-sm)">Already have an account? <a href="#/login">Log in</a></p>
        </div>
      </cc-card>
    </div>
  `;

  container.querySelector('#signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#name').value;
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    try {
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      alert('Account created. Please login.');
      window.location.hash = '#/login';
    } catch (err) {
      alert('Signup failed: ' + err.message);
    }
  });
}
