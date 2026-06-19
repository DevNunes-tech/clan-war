const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                id: user.id,
                name: user.name || (user.email.includes('@clash.com') ? user.clanTag : user.email.split('@')[0]),
                tag: user.clanTag,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            Object.assign(user, req.body);
            await user.save();
            res.json({
                success: true,
                profile: {
                    id: user.id,
                    name: user.name,
                    tag: user.clanTag,
                    email: user.email,
                    role: user.role,
                    preferences: user.preferences
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET Preferences
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user ? user.preferences : {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            const newPrefs = { ...user.preferences, ...req.body };
            user.preferences = newPrefs;
            await user.save();
            res.json({ success: true, prefs: user.preferences });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
