const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.data || data;
}

export async function apiGet(path: string, token?: string) {
  return apiFetch(path, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function apiPost(path: string, body: unknown, token?: string) {
  return apiFetch(path, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}

export async function apiPut(path: string, body: unknown, token?: string) {
  return apiFetch(path, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(body),
  });
}
