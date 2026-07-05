const API_URL = import.meta.env.VITE_API_URL || 'https://clan-war-yyeq.vercel.app';

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
