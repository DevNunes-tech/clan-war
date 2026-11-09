// ─────────────────────────────────────────────────────────────
// Configuração da API
// ─────────────────────────────────────────────────────────────
// URL fixa do backend no Fly.io
const API_URL = 'https://clan-war.fly.dev';

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'token';

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
 * @param {object} options - { method, body, params, headers, skipAuth, signal }
 */
export async function apiFetch(path, options = {}) {
    const {
        method = 'GET',
        body,
        params = {},
        headers = {},
        skipAuth = false,
        signal,
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
    // Nota: Se for FormData, o navegador define o Content-Type automaticamente (com o boundary).

    const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
        signal,
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
            // Verifica se está no navegador antes de disparar o evento
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
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
    // Garante que o path sempre comece com '/'
    const safePath = path.startsWith('/') ? path : `/${path}`;
    // Remove barra final da API_URL (se houver)
    const safeBase = API_URL.replace(/\/+$/, '');
    
    const url = new URL(safePath, safeBase);
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
