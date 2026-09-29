const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
	assessCurrentLivelihood,
	getCurrentTwin,
	getReviewQueue,
	reviewTwin,
} = require('../controllers/workflowController');

const router = express.Router();

router.use(protect);
router.post('/assess', assessCurrentLivelihood);
router.get('/twin', getCurrentTwin);
router.get('/review-queue', requireRole('OFFICER', 'ADMIN'), getReviewQueue);
router.patch('/:id/review', requireRole('OFFICER', 'ADMIN'), reviewTwin);

module.exports = router;