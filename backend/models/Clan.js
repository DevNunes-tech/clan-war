const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    medals: {
        type: Number,
        default: 0
    },
    members: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Clan', clanSchema);
