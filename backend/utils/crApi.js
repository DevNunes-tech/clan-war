const axios = require('axios');
require('dotenv').config();

const FALLBACK_BASE_URL = 'https://proxy.royaleapi.dev/v1';

const normalizeBaseUrl = (value) => {
    const configuredUrl = String(value || '').trim();
    const urlMatch = configuredUrl.match(/https?:\/\/[^)\]\s]+/i);
    const candidate = (urlMatch ? urlMatch[0] : configuredUrl).replace(/\/+$/, '');

    try {
        const parsed = new URL(candidate || FALLBACK_BASE_URL);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocolo inválido');
        return parsed.toString().replace(/\/+$/, '');
    } catch (error) {
        console.error('CLASH_ROYALE_BASE_URL inválida; usando o proxy padrão:', error.message);
        return FALLBACK_BASE_URL;
    }
};

const getApiKey = () => {
    const key = String(process.env.CLASH_ROYALE_API_KEY || '').trim().replace(/^Bearer\s+/i, '');
    if (!key) {
        throw new Error('CLASH_ROYALE_API_KEY não definida ou vazia no ambiente');
    }
    return key;
};

const crApi = axios.create({
    baseURL: normalizeBaseUrl(process.env.CLASH_ROYALE_BASE_URL),
    timeout: 10000,
    headers: { 'Accept': 'application/json' }
});

// Injeta a chave NO MOMENTO da requisição — evita "Bearer undefined" no load do módulo
crApi.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${getApiKey()}`;
    return config;
});

// Log seguro (sem expor a chave) para debug no Render
crApi.interceptors.request.use((config) => {
    const key = String(process.env.CLASH_ROYALE_API_KEY || '');
    console.log(`[crApi] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} | keyLen=${key.length} prefix=${key.slice(0,3)}`);
    return config;
});

crApi.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 403) {
            console.error('[crApi] 403 Forbidden — verifique: (1) token do proxy RoyaleAPI, (2) CLASH_ROYALE_API_KEY no Render sem aspas/espaços, (3) CLASH_ROYALE_BASE_URL não apontando para api.clashroyale.com', data);
        }
        return Promise.reject(err);
    }
);

const encodeTag = (tag) => {
    const normalizedTag = String(tag || '').trim();
    const tagWithHash = normalizedTag.startsWith('#') ? normalizedTag : `#${normalizedTag}`;
    return encodeURIComponent(tagWithHash);
};

exports.getClan = async (clanTag) => {
    try {
        const response = await crApi.get(`/clans/${encodeTag(clanTag)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching clan from CR API:', error.response?.data || error.message);
        throw error;
    }
};

exports.getRiverRace = async (clanTag) => {
    try {
        const response = await crApi.get(`/clans/${encodeTag(clanTag)}/currentriverrace`);
        return response.data;
    } catch (error) {
        console.error('Error fetching river race from CR API:', error.response?.data || error.message);
        throw error;
    }
};

exports.getWarLog = async (clanTag) => {
    try {
        const response = await crApi.get(`/clans/${encodeTag(clanTag)}/riverracelog?limit=10`);
        return response.data;
    } catch (error) {
        console.error('Error fetching war log from CR API:', error.response?.data || error.message);
        throw error;
    }
};

exports.getPlayer = async (playerTag) => {
    try {
        const response = await crApi.get(`/players/${encodeTag(playerTag)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching player from CR API:', error.response?.data || error.message);
        throw error;
    }
};