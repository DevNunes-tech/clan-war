const axios = require('axios');
require('dotenv').config();

const normalizeBaseUrl = (value) => {
    const configuredUrl = String(value || '').trim();
    const urlMatch = configuredUrl.match(/https?:\/\/[^)\]\s]+/i);
    const candidate = (urlMatch ? urlMatch[0] : configuredUrl).replace(/\/+$/, '');
    const fallback = 'https://proxy.royaleapi.dev/v1';

    try {
        const parsed = new URL(candidate || fallback);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocolo inválido');
        return parsed.toString().replace(/\/+$/, '');
    } catch (error) {
        console.error('CLASH_ROYALE_BASE_URL inválida; usando o proxy padrão:', error.message);
        return fallback;
    }
};

const cleanApiKey = (key) => {
    let cleaned = String(key || '').trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned;
};

const crApi = axios.create({
    baseURL,
    timeout: 10000
});

crApi.interceptors.request.use((config) => {
    const apiKey = cleanApiKey(process.env.CLASH_ROYALE_API_KEY);
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${apiKey}`;
    return config;
});

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

module.exports = exports;
