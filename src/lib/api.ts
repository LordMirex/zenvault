const ACCESS_TOKEN_KEY = 'qfs_access_token';
const PENDING_TOKEN_KEY = 'qfs_pending_token';
const AUTH_NOTICE_KEY = 'qfs_auth_notice';
const ADMIN_TOKEN_BACKUP_KEY = 'qfs_admin_backup';
const IMPERSONATION_ACTIVE_KEY = 'qfs_impersonation_active';

export const AUTH_EXPIRED_EVENT = 'qfs:auth-expired';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

type RequestOptions = RequestInit & {
  token?: string | null;
};

export const getAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token: string) => window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const clearAccessToken = () => window.localStorage.removeItem(ACCESS_TOKEN_KEY);

export const getPendingToken = () => window.localStorage.getItem(PENDING_TOKEN_KEY);
export const setPendingToken = (token: string) => window.localStorage.setItem(PENDING_TOKEN_KEY, token);
export const clearPendingToken = () => window.localStorage.removeItem(PENDING_TOKEN_KEY);

export const isImpersonating = () => window.localStorage.getItem(IMPERSONATION_ACTIVE_KEY) === '1';

export const setImpersonationToken = (token: string) => {
  const current = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (current) {
    window.localStorage.setItem(ADMIN_TOKEN_BACKUP_KEY, current);
  }
  window.localStorage.setItem(IMPERSONATION_ACTIVE_KEY, '1');
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const exitImpersonation = () => {
  const adminToken = window.localStorage.getItem(ADMIN_TOKEN_BACKUP_KEY);
  window.localStorage.removeItem(IMPERSONATION_ACTIVE_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_BACKUP_KEY);
  if (adminToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, adminToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const clearStoredAuth = () => {
  if (isImpersonating()) {
    exitImpersonation();
    clearPendingToken();
    window.location.replace('/admin/dashboard');
    return;
  }
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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = resolveToken(options);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestUrl = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`;

  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : 'Request failed.';

    if (response.status === 401 && token) {
      const wasImpersonating = isImpersonating();
      clearStoredAuth();
      if (!wasImpersonating) {
        window.sessionStorage.setItem(AUTH_NOTICE_KEY, message);
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
      }
    }

    throw new Error(message);
  }

  return payload as T;
};
