const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');
const auth = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// Rotas públicas (leitura — dashboard acessível sem login)
// ─────────────────────────────────────────────────────────────
router.get('/stats', clanController.getClanStats);
router.get('/history', clanController.getWarHistory);

// ─────────────────────────────────────────────────────────────
// Rotas protegidas (escrita — requer JWT válido)
// ─────────────────────────────────────────────────────────────
router.post('/attendance', auth, clanController.saveWarAttendance);

module.exports = router;