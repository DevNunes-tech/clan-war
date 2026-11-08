// ─────────────────────────────────────────────────────────────
// Configuração da API
// ─────────────────────────────────────────────────────────────
const normalizeApiUrl = (value) => {
    const configuredUrl = String(value || '').trim();
    if (!configuredUrl) return '';

    const urlMatch = configuredUrl.match(/https?:\/\/[^)\]\s]+/i);
    return (urlMatch ? urlMatch[0] : configuredUrl).replace(/\/+$/, '');
};

const API_URL =
    normalizeApiUrl(import.meta.env.VITE_API_URL) ||
    (import.meta.env.DEV
        ? 'http://localhost:5000'
        : 'https://clan-war.onrender.com');

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'wartracker_token';

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token) => {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        // localStorage indisponível (modo privado)
    }
};

export const clearToken = () => setToken(null);

// ─────────────────────────────────────────────────────────────
// Cliente HTTP centralizado
// ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Faz uma request à API com:
 * - Token JWT automático (se existir)
 * - JSON parsing
 * - Tratamento de 401 (token expirado → limpa token)
 * - Tratamento de 403 (retorna mensagem)
 *
 * @param {string} path - Ex: '/api/clan/stats'
 * @param {object} options - { method, body, params, headers, skipAuth }
 */
export async function apiFetch(path, options = {}) {
    const {
        method = 'GET',
        body,
        params = {},
        headers = {},
        skipAuth = false,
    } = options;

    const url = buildUrl(path, params);
    const finalHeaders = {
        Accept: 'application/json',
        ...headers,
    };

    // Adiciona token (exceto se skipAuth)
    if (!skipAuth) {
        const token = getToken();
        if (token) {
            finalHeaders.Authorization = `Bearer ${token}`;
        }
    }

    // Body JSON
    let finalBody = body;
    if (body !== undefined && !(body instanceof FormData)) {
        finalHeaders['Content-Type'] = 'application/json';
        finalBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    // Parse do body (JSON ou texto)
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
    } else {
        data = await response.text().catch(() => null);
    }

    // ─── Tratamento de erros ───
    if (!response.ok) {
        // 401: token inválido/expirado → limpa e sinaliza
        if (response.status === 401) {
            clearToken();
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        const message =
            data?.message ||
            data?.error ||
            `Erro ${response.status}: ${response.statusText}`;

        throw new ApiError(message, response.status, data);
    }

    return data;
}

// ─────────────────────────────────────────────────────────────
// buildUrl (mantido para compatibilidade)
// ─────────────────────────────────────────────────────────────
export function buildUrl(path, params = {}) {
    const url = new URL(path, API_URL);
    Object.keys(params).forEach((k) => {
        if (params[k] !== undefined && params[k] !== null) {
            url.searchParams.set(k, String(params[k]));
        }
    });
    return url.toString();
}

// ─────────────────────────────────────────────────────────────
// Atalhos por método
// ─────────────────────────────────────────────────────────────
export const apiGet = (path, options = {}) =>
    apiFetch(path, { ...options, method: 'GET' });

export const apiPost = (path, body, options = {}) =>
    apiFetch(path, { ...options, method: 'POST', body });

export const apiPut = (path, body, options = {}) =>
    apiFetch(path, { ...options, method: 'PUT', body });

export const apiDelete = (path, options = {}) =>
    apiFetch(path, { ...options, method: 'DELETE' });

export default API_URL;