(() => {
  const messages = new Map([
    [400, 'The request is invalid.'],
    [403, 'Your session has expired. Please sign in again.'],
    [404, 'The requested resource was not found.'],
    [409, 'The submitted value conflicts with existing data.'],
  ]);

  class ApiError extends Error {
    constructor(status, message) {
      super(message || messages.get(status) || `Request failed (${status}).`);
      this.name = 'ApiError';
      this.status = status;
    }
  }

  /**
   * @description Calls the same-origin site API and rejects every non-success response.
   * @param {string} path API path relative to /api/v1.
   * @param {RequestInit} options Fetch options for the request.
   * @throws {ApiError} When the server rejects the request.
   */
  window.siteApi = async (path, options = {}) => {
    const jsonBody = options.body && !(options.body instanceof FormData);
    const response = await fetch(`/api/v1${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: jsonBody
        ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
        : options.headers,
    });
    if (!response.ok) {
      const contentType = response.headers.get('Content-Type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : undefined;
      throw new ApiError(response.status, payload?.message);
    }
    if (response.status === 204) {
      return undefined;
    }
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    if (contentType.startsWith('text/')) {
      return response.text();
    }
    return undefined;
  };
})();
