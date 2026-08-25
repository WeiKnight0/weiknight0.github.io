export interface NoteAsset {
  id: string;
  url: string;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface NoteSummary {
  id?: number;
  slug: string;
  title: string;
  summary?: string;
  coverUrl?: string | null;
  tags?: string[];
  series?: string | null;
  seriesOrder?: number | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  updatedAt: string;
}

export interface NoteArticle extends Omit<NoteSummary, 'tags'> {
  id: number;
  summary: string;
  coverUrl: string | null;
  tags: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  contentFormat: 'MARKDOWN' | 'JSON';
  content: string;
}

/**
 * @description Calls one same-origin JSON endpoint and fails on every non-success response.
 * @param path API path beginning with /api/v1.
 * @param options Fetch options including an optional JSON or multipart body.
 * @throws Error when the server rejects the request or returns an invalid payload.
 */
export async function noteApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', ...options });
  if (response.status === 403) {
    window.location.replace('/login/');
    throw new Error('Administrator or member access is required.');
  }
  if (!response.ok) {
    const payload = await response.json() as { message?: string };
    throw new Error(payload.message ?? `Request failed (${response.status}).`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

/**
 * @description Uploads an image and returns its stable article resource URL.
 * @param file Image supplied through file selection, paste, or drag-and-drop.
 * @throws Error when the server rejects the image.
 */
export async function uploadNoteAsset(file: File): Promise<NoteAsset> {
  const body = new FormData();
  body.append('file', file);
  return noteApi<NoteAsset>('/api/v1/admin/note-assets', { method: 'POST', body });
}
