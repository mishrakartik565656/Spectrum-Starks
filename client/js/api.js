const API_BASE = 'http://localhost:3000/api';

export async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  if (options.body && options.body instanceof FormData) {
    delete defaultHeaders['Content-Type']; // Let browser set boundary
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const errData = await response.json();
      message = errData.error || message;
    } catch (e) {}
    throw new Error(message);
  }

  // Not all endpoints return JSON (e.g. 204 No Content)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
