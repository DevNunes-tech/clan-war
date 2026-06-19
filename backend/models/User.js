const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: true
    },
    clanTag: {
        type: String,
        default: null
    },
    role: {
        type: String,
        default: 'member'
    },
    preferences: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            notifications: true,
            dmAlerts: true,
            language: 'Português',
            darkMode: false
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
