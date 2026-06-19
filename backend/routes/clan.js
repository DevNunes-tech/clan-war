const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');

router.get('/stats', clanController.getClanStats);
router.get('/history', clanController.getWarHistory);
router.post('/attendance', clanController.saveWarAttendance);

module.exports = router;
