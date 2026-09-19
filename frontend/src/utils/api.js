const normalizeApiUrl = (value) => {
  const configuredUrl = String(value || '').trim();
  if (!configuredUrl) return '';

  const urlMatch = configuredUrl.match(/https?:\/\/[^)\]\s]+/i);
  return (urlMatch ? urlMatch[0] : configuredUrl).replace(/\/+$/, '');
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL)
  || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://clan-war.onrender.com');

export function buildUrl(path, params = {}) {
  const url = new URL(path, API_URL);
  Object.keys(params).forEach((k) => {
    if (params[k] !== undefined && params[k] !== null) {
      url.searchParams.set(k, String(params[k]));
    }
  });
  return url.toString();
}

export default API_URL;
