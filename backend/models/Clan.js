const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// Subdocumento: registro de justificativa de guerra
// ─────────────────────────────────────────────────────────────
const warAttendanceSchema = new mongoose.Schema(
    {
        dateKey: {
            type: String,
            required: true,
            trim: true,
            match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        },
        dateLabel: {
            type: String,
            required: true,
            trim: true,
        },
        memberName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        memberTag: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        decksUsed: {
            type: Number,
            required: true,
            min: 0,
            max: 4, // limite diário
        },
        decksMissed: {
            type: Number,
            required: true,
            min: 0,
            max: 4,
        },
        justification: {
            type: String,
            default: '',
            trim: true,
            maxlength: 500,
        },
        reportedBy: {
            type: String,
            default: '',
            trim: true,
            maxlength: 100,
        },
    },
    {
        timestamps: true,
        _id: true, // mantém _id para permitir updates individuais
    }
);

// ─────────────────────────────────────────────────────────────
// Schema principal do clã
// ─────────────────────────────────────────────────────────────
const clanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        tag: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true, // redundante com unique, mas explícito
        },
        fame: {
            type: Number,
            default: 0,
            min: 0,
        },
        members: {
            // Mantido como Mixed para compatibilidade com o payload da API
            // (trocar por sub-schema se quiser tipagem estrita)
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        warAttendance: {
            type: [warAttendanceSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// ─────────────────────────────────────────────────────────────
// Índices (para queries futuras)
// ─────────────────────────────────────────────────────────────
// Acelera busca por justificativas de um membro em um período
clanSchema.index({ 'warAttendance.memberTag': 1, 'warAttendance.dateKey': 1 });

module.exports = mongoose.model('Clan', clanSchema);