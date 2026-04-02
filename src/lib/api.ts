const ACCESS_TOKEN_KEY = 'qfs_access_token';
const PENDING_TOKEN_KEY = 'qfs_pending_token';
const AUTH_NOTICE_KEY = 'qfs_auth_notice';
export const AUTH_EXPIRED_EVENT = 'qfs:auth-expired';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

type RequestOptions = RequestInit & {
  token?: string | null;
};

export const getAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string) => window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const clearAccessToken = () => window.localStorage.removeItem(ACCESS_TOKEN_KEY);

export const getPendingToken = () => window.localStorage.getItem(PENDING_TOKEN_KEY);
export const setPendingToken = (token: string) => window.localStorage.setItem(PENDING_TOKEN_KEY, token);
export const clearPendingToken = () => window.localStorage.removeItem(PENDING_TOKEN_KEY);

export const clearStoredAuth = () => {
  clearAccessToken();
  clearPendingToken();
};

export const consumeAuthNotice = () => {
  const message = window.sessionStorage.getItem(AUTH_NOTICE_KEY) ?? '';
  if (message) {
    window.sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return message;
};

const resolveToken = (options: RequestOptions) =>
  Object.prototype.hasOwnProperty.call(options, 'token') ? options.token ?? null : getAccessToken();

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  const hasBody = options.body !== undefined;
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = resolveToken(options);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestUrl = /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Request failed.';

    if (response.status === 401 && token) {
      clearStoredAuth();
      window.sessionStorage.setItem(AUTH_NOTICE_KEY, message);
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
    }

    throw new Error(message);
  }

  return payload as T;
};
