const TOKEN_STORAGE_KEY = 'hiremate_token';

let getClerkTokenAsync = async () => null;

export function setClerkTokenGetter(fn) {
  getClerkTokenAsync = fn;
}

export const tokenStorage = {
  get() { return null; },
  set() {},
  clear() {}
};

export async function authHeaders() {
  const token = await getClerkTokenAsync();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch JSON with optional JWT Authorization header.
 */
export async function fetchJson(url, options = {}, { auth = 'none' } = {}) {
  const {
    headers: inputHeaders = {},
    body: inputBody,
    ...rest
  } = options;

  const headers = { ...inputHeaders };

  if (auth === 'optional' || auth === 'required') {
    const token = await getClerkTokenAsync();
    if (!token && auth === 'required') {
      throw new Error('Not authenticated');
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let body = inputBody;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && body !== null && !isFormData && typeof body === 'object' && !(body instanceof Blob)) {
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    body
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message = (data && typeof data === 'object' && data.message)
      ? data.message
      : `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
