const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const crApi = require('../utils/crApi');
const { validateEnvMiddleware } = require('../middleware/validateEnv');

// ─────────────────────────────────────────────────────────────
// Rate limit específico para login
// ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20,                  // 20 tentativas por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message:
            'Muitas tentativas de login. Tente novamente em alguns minutos.',
    },
});

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const ALLOWED_ROLES = ['leader', 'coleader'];
const JWT_EXPIRES_IN = '12h';
const EMAIL_DOMAIN = 'clash-royale.local'; // domínio fake, não envia email

// Tags liberadas para acesso VIP. Adicione ou remova clientes conforme necessário.
const CLIENTES_VIP = [
    '#RU99V8YV9', // Tag de teste (Deivinho)
    '#GG9JYGCOP', // Tag de teste (Piauí)
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
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

const isValidTag = (tag) => /^#[0-9A-Z]{3,15}$/.test(tag);

const buildUserEmail = (playerTag) =>
    `${playerTag.replace('#', '').toLowerCase()}@${EMAIL_DOMAIN}`;

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, validateEnvMiddleware, async (req, res) => {
    const { playerTag } = req.body || {};

    // 1. Validar input
    if (!playerTag) {
        return res
            .status(400)
            .json({ success: false, message: 'Tag do jogador é obrigatória' });
    }

    const normalizedPlayerTag = normalizeTag(playerTag);

    if (!isValidTag(normalizedPlayerTag)) {
        return res.status(400).json({
            success: false,
            message: 'Tag inválida. Use o formato #ABC123.',
        });
    }

    // 2. Validar CLAN_TAG no servidor
    const envClanTag = normalizeTag(process.env.CLAN_TAG);
    if (!isValidTag(envClanTag)) {
        console.error(
            '[auth/login] CLAN_TAG inválida no servidor:',
            process.env.CLAN_TAG
        );
        return res.status(500).json({
            success: false,
            message:
                'Tag do clã não está configurada corretamente no servidor.',
        });
    }

    // 3. Verificar assinatura antes de consultar a API externa.
    if (!CLIENTES_VIP.includes(normalizedPlayerTag)) {
        console.warn(`[auth/login] Acesso negado (não VIP): ${normalizedPlayerTag}`);
        return res.status(403).json({
            success: false,
            message: 'Assinatura inativa. Entre em contato com o suporte para liberar seu acesso VIP.',
        });
    }

    try {
        // 4. Buscar jogador na API do Clash Royale
        //    ⚠️ O endpoint /players/{tag} NÃO retorna o campo `role`.
        const player = await crApi.getPlayer(normalizedPlayerTag);

        // 5. Validar que o jogador tem clã
        if (!player.clan) {
            return res.status(403).json({
                success: false,
                message: 'Você não está em nenhum clã.',
            });
        }

        // 6. Validar que o jogador pertence ao clã monitorado
        if (normalizeTag(player.clan.tag) !== envClanTag) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Você não pertence ao clã monitorado.',
            });
        }

        // 7. Buscar `role` via endpoint de membros do clã
        //    (o /players não retorna role)
        const clan = await crApi.getClan(envClanTag);
        const member = Array.isArray(clan.memberList)
            ? clan.memberList.find(
                  (m) => normalizeTag(m.tag) === normalizedPlayerTag
              )
            : null;

        const role = String(member?.role || '').toLowerCase();

        if (!ALLOWED_ROLES.includes(role)) {
            return res.status(403).json({
                success: false,
                message: `Acesso negado. Apenas Líderes e Co-líderes podem entrar. Seu cargo: ${member?.role || 'desconhecido'}`,
            });
        }

        // 8. Upsert atômico do usuário (evita race condition)
        const user = await User.findOneAndUpdate(
            { playerTag: normalizedPlayerTag },
            {
                $setOnInsert: {
                    name: player.name,
                    email: buildUserEmail(normalizedPlayerTag),
                    playerTag: normalizedPlayerTag,
                    clanTag: envClanTag,
                    authProvider: 'clash-royale',
                },
                $set: {
                    name: player.name,
                    role: member.role,
                    clanTag: envClanTag,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
            }
        );

        if (!user) {
            console.error('[auth/login] findOneAndUpdate retornou null');
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar/atualizar usuário.',
            });
        }

        // 9. Gerar JWT
        const token = jwt.sign(
            { id: user._id.toString(), tag: normalizedPlayerTag },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 10. Responder (sem expor password — o schema já remove via toJSON)
        return res.json({
            success: true,
            token,
            user: {
                name: user.name || player.name,
                role: user.role,
                tag: normalizedPlayerTag,
                clanTag: envClanTag,
            },
        });
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data;

        console.error('[auth/login] erro:', {
            message: error.message,
            status,
            data,
            url: error.config?.url,
        });

        let message = 'Erro na autenticação';

        if (status === 403) {
            const raw = JSON.stringify(data || {}).toLowerCase();
            if (
                raw.includes('invalid authorization') ||
                raw.includes('accessdenied')
            ) {
                message =
                    'A API do Clash Royale recusou a chave. Confira CLASH_ROYALE_API_KEY no Render e se é um token do RoyaleAPI.';
            } else {
                message =
                    'A API do Clash Royale recusou o acesso. Verifique a chave e o IP de saída.';
            }
        } else if (status === 404) {
            message = 'Jogador não encontrado na API do Clash Royale.';
        } else if (status === 429) {
            message =
                'Limite de requisições da API atingido. Tente novamente em alguns minutos.';
        }

        return res.status(status).json({ success: false, message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: 'Usuário não encontrado.' });
        }
        return res.json({
            success: true,
            user: {
                name: user.name,
                role: user.role,
                tag: user.playerTag,
                clanTag: user.clanTag,
            },
        });
    } catch (error) {
        console.error('[auth/me] erro:', error);
        return res
            .status(500)
            .json({ success: false, message: 'Erro ao buscar usuário.' });
    }
});

module.exports = router;