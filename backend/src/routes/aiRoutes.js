const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze', aiController.analyzeCode);
router.get('/reviews', aiController.getReviews);

module.exports = router;
