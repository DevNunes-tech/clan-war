const mongoose = require('mongoose');

const warAttendanceSchema = new mongoose.Schema({
    dateKey: {
        type: String,
        required: true,
        trim: true
    },
    dateLabel: {
        type: String,
        required: true,
        trim: true
    },
    memberName: {
        type: String,
        required: true,
        trim: true
    },
    memberTag: {
        type: String,
        required: true,
        trim: true
    },
    decksUsed: {
        type: Number,
        required: true,
        min: 0
    },
    decksMissed: {
        type: Number,
        required: true,
        min: 0
    },
    justification: {
        type: String,
        default: '',
        trim: true
    },
    reportedBy: {
        type: String,
        default: '',
        trim: true
    }
}, {
    timestamps: true
});

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
    },
    warAttendance: {
        type: [warAttendanceSchema],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Clan', clanSchema);
