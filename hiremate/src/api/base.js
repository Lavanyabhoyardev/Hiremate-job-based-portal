export function getApiBase() {
  const raw = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE))
    ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)
    : '';
  // Normalize the base URL. Every caller appends "/api/..." itself, so the base
  // must NOT end with "/api". This strips trailing slashes and a trailing "/api"
  // so the env var works whether it's set as ".../api" or just the host —
  // preventing the double "/api/api/..." bug.
  const cleaned = raw.trim().replace(/\/+$/, '').replace(/\/api$/i, '');
  if (cleaned) return cleaned;
  // Local dev fallback
  return 'http://localhost:5001';
}

export const API_BASE = getApiBase();
