const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// Sub-schema: preferências do usuário
// ─────────────────────────────────────────────────────────────
const preferencesSchema = new mongoose.Schema(
    {
        notifications: { type: Boolean, default: true },
        dmAlerts: { type: Boolean, default: true },
        language: { type: String, default: 'Português' },
        darkMode: { type: Boolean, default: false },
    },
    { _id: false }
);

// ─────────────────────────────────────────────────────────────
// Schema principal
// ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: null,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
        },
        password: {
            type: String,
            required: false,   // usuários via Clash Royale não têm senha
            select: false,     // nunca retorna em queries por padrão
        },
        authProvider: {
            type: String,
            enum: ['clash-royale', 'local'],
            default: 'clash-royale',
        },
        playerTag: {
            type: String,
            default: null,
            trim: true,
            uppercase: true,
            index: true,       // queries por playerTag são frequentes
        },
        clanTag: {
            type: String,
            default: null,
            trim: true,
            uppercase: true,
        },
        role: {
            type: String,
            enum: ['leader', 'coleader', 'elder', 'member'],
            default: 'member',
        },
        preferences: {
            type: preferencesSchema,
            default: () => ({}),   // Mongoose aplica defaults do sub-schema
        },
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// Nunca retornar password em JSON
// ─────────────────────────────────────────────────────────────
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);