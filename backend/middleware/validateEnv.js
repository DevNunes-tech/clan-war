// ─────────────────────────────────────────────────────────────
// Validação de variáveis de ambiente
// ─────────────────────────────────────────────────────────────
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLASH_ROYALE_API_KEY',
    'CLAN_TAG',
];

// Utilitário: remove aspas e normaliza tag do Clash Royale
const normalizeTag = (tag) => {
    let normalized = String(tag || '').trim();
    if (
        (normalized.startsWith('"') && normalized.endsWith('"')) ||
        (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
        normalized = normalized.slice(1, -1).trim();
    }
    if (!normalized.startsWith('#')) normalized = `#${normalized}`;
    return normalized.toUpperCase();
};

function getMissingEnvVars() {
    return requiredEnvVars.filter(
        (name) =>
            !process.env[name] || String(process.env[name]).trim() === ''
    );
}

function ensureEnv() {
    // 1. Variáveis obrigatórias
    const missing = getMissingEnvVars();
    if (missing.length > 0) {
        const message = `Variáveis de ambiente ausentes: ${missing.join(', ')}`;
        console.error('[ensureEnv]', message);
        throw new Error(message);
    }

    // 2. Normalizar e validar CLAN_TAG
    process.env.CLAN_TAG = normalizeTag(process.env.CLAN_TAG);
    if (process.env.CLAN_TAG === '#') {
        const message = 'CLAN_TAG inválida. Verifique o arquivo .env.';
        console.error('[ensureEnv]', message);
        throw new Error(message);
    }

    // 3. Validar formato do MONGODB_URI
    if (!/^mongodb(\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
        const message =
            'MONGODB_URI inválida: deve começar com mongodb:// ou mongodb+srv://';
        console.error('[ensureEnv]', message);
        throw new Error(message);
    }

    // 4. Validar tamanho mínimo do JWT_SECRET
    if (String(process.env.JWT_SECRET).length < 32) {
        const message =
            'JWT_SECRET muito curto: use no mínimo 32 caracteres (ideal: 64 hex)';
        console.error('[ensureEnv]', message);
        throw new Error(message);
    }

    // 5. Avisos (não bloqueiam o boot)
    if (String(process.env.CLASH_ROYALE_API_KEY).length < 20) {
        console.warn(
            '[ensureEnv] ⚠️ CLASH_ROYALE_API_KEY parece muito curta — confirme se é um token válido do RoyaleAPI'
        );
    }

    const baseUrl = process.env.CLASH_ROYALE_BASE_URL;
    if (baseUrl && /api\.clashroyale\.com/i.test(baseUrl)) {
        console.warn(
            '[ensureEnv] ⚠️ CLASH_ROYALE_BASE_URL aponta para a API OFICIAL. ' +
                'No Render (IP dinâmico), isso causa 403. Use o proxy RoyaleAPI ' +
                '(https://proxy.royaleapi.dev/v1) ou remova essa env.'
        );
    }

    console.log(
        `[ensureEnv] ✅ Envs OK — CLAN_TAG=${process.env.CLAN_TAG}, ` +
            `BASE_URL=${baseUrl || '(fallback RoyaleAPI)'}, ` +
            `API_KEY=${process.env.CLASH_ROYALE_API_KEY.length} chars`
    );
}

function validateEnvMiddleware(req, res, next) {
    try {
        ensureEnv();
        next();
    } catch (error) {
        console.error('[validateEnvMiddleware]', error.message);
        res.status(500).json({
            success: false,
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Erro de configuração do servidor.'
                    : error.message,
        });
    }
}

module.exports = {
    ensureEnv,
    validateEnvMiddleware,
};