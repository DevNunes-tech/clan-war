const express = require('express');
const router = express.Router();
const clanController = require('../controllers/clanController');
const auth = require('../middleware/auth');

router.get('/stats', auth, clanController.getClanStats);
router.get('/history', auth, clanController.getWarHistory);
router.post('/attendance', auth, clanController.saveWarAttendance);

module.exports = router;
