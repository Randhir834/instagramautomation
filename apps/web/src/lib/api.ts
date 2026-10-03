import type { ApiError } from '@repo/shared';
import { API_URL } from './utils';

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/** Fetch wrapper for the backend. Sends the httpOnly auth cookie on every call. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(
      0,
      'Could not reach the server. Check your connection and try again.',
    );
  }

  if (!res.ok) {
    const error = (await res.json().catch(() => null)) as ApiError | null;
    const message = Array.isArray(error?.message) ? error.message.join('. ') : error?.message;
    throw new ApiRequestError(
      res.status,
      res.status === 429
        ? 'Too many attempts. Please wait a minute and try again.'
        : (message ?? 'Something went wrong. Please try again.'),
    );
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const apiGet = <T>(path: string) => api<T>(path, { method: 'GET' });
export const apiPost = <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body });
export const apiPatch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body });
export const apiDelete = <T = void>(path: string) => api<T>(path, { method: 'DELETE' });

/** Server-side fetch for public pages. Returns null on 404 so the page can show "not found". */
export async function fetchPublic<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

/** Turns any thrown value into a sentence that can be shown to a person. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}
