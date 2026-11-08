const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// Campos que o usuário pode alterar
// ─────────────────────────────────────────────────────────────
const ALLOWED_PROFILE_FIELDS = ['name']; // ⚠️ email removido
const ALLOWED_PREF_FIELDS = ['notifications', 'dmAlerts', 'language', 'darkMode'];

// ─────────────────────────────────────────────────────────────
// Helper: serializar usuário para response (nunca expõe password)
// ─────────────────────────────────────────────────────────────
const serializeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    playerTag: user.playerTag,
    clanTag: user.clanTag,
    email: user.email,
    role: user.role,
    preferences: user.preferences,
});

// ─────────────────────────────────────────────────────────────
// GET /api/user/ — info da API
// ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
    res.json({
        message: 'User API is running',
        endpoints: ['/api/user/profile', '/api/user/preferences'],
    });
});

// ─────────────────────────────────────────────────────────────
// GET /api/user/profile
// ─────────────────────────────────────────────────────────────
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(serializeUser(user));
    } catch (error) {
        console.error('[user/profile GET]', error);
        return res.status(500).json({
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Erro interno do servidor'
                    : error.message,
        });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/user/profile
// ─────────────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Aplica só campos permitidos
        ALLOWED_PROFILE_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        return res.json({
            success: true,
            profile: serializeUser(user),
        });
    } catch (error) {
        console.error('[user/profile PUT]', error);

        // Tratar erro de validação do Mongoose (email inválido, etc.)
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Dados inválidos',
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }

        return res.status(500).json({
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Erro interno do servidor'
                    : error.message,
        });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/user/preferences
// ─────────────────────────────────────────────────────────────
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user.preferences || {});
    } catch (error) {
        console.error('[user/preferences GET]', error);
        return res.status(500).json({
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Erro interno do servidor'
                    : error.message,
        });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/user/preferences
// ─────────────────────────────────────────────────────────────
router.put('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentPrefs =
            user.preferences?.toObject?.() || user.preferences || {};

        const newPrefs = { ...currentPrefs };
        ALLOWED_PREF_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) {
                newPrefs[field] = req.body[field];
            }
        });

        user.preferences = newPrefs;
        await user.save();

        return res.json({ success: true, prefs: user.preferences });
    } catch (error) {
        console.error('[user/preferences PUT]', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Preferências inválidas',
                errors: Object.values(error.errors).map((e) => e.message),
            });
        }

        return res.status(500).json({
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Erro interno do servidor'
                    : error.message,
        });
    }
});

module.exports = router;