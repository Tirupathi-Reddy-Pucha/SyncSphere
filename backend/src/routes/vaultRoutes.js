const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/status', vaultController.getVaultStatus);
router.get('/secrets', vaultController.listSecrets);
router.post('/set', optionalAuth, vaultController.setSecret);
router.post('/sync', optionalAuth, vaultController.refreshSecrets);

module.exports = router;
