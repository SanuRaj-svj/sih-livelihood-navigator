const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRecommendationsForCurrentUser } = require('../controllers/recommendationController');

const router = express.Router();

router.use(protect);

router.get('/', getRecommendationsForCurrentUser);

module.exports = router;
