const messages = new Map([
  [400, 'The request is invalid.'],
  [403, 'Your session has expired. Please sign in again.'],
  [404, 'The requested resource was not found.'],
  [409, 'The submitted value conflicts with existing data.'],
]);

let csrfToken: string | undefined;

const csrf = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' });
  if (!response.ok) throw new SiteApiError(response.status);
  const payload = await response.json() as { token: string };
  csrfToken = payload.token;
  return csrfToken;
};

/**
 * @description Preserves the HTTP status of one rejected site API request.
 */
export class SiteApiError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message || messages.get(status) || `Request failed (${status}).`);
    this.name = 'SiteApiError';
    this.status = status;
  }
}

/**
 * @description Calls the same-origin site API and rejects every non-success response.
 * @param path API path relative to /api/v1.
 * @param options Fetch options containing an optional JSON or multipart body.
 * @throws SiteApiError when the server rejects the request.
 */
export async function siteApi<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const jsonBody = options.body && !(options.body instanceof FormData);
  const method = options.method?.toUpperCase() || 'GET';
  const headers = new Headers(options.headers);
  if (jsonBody) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-CSRF-Token', await csrf());
  }
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'same-origin',
    ...options,
    headers,
  });
  const contentType = response.headers.get('Content-Type') || '';
  if (!response.ok) {
    const payload = contentType.includes('application/json')
      ? await response.json() as { message?: string }
      : undefined;
    throw new SiteApiError(response.status, payload?.message);
  }
  if (response.status === 204) return undefined as T;
  if (contentType.includes('application/json')) return response.json() as Promise<T>;
  if (contentType.startsWith('text/')) return response.text() as Promise<T>;
  return undefined as T;
}
