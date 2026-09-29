const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createVideoCallRequest,
  getMyVideoCallRequest,
  getPendingVideoCallRequests,
  getVideoCallRequest,
  acceptVideoCallRequest,
  declineVideoCallRequest,
} = require('../controllers/videoCallController');

const router = express.Router();

router.use(protect);
router.post('/', requireRole('BENEFICIARY'), createVideoCallRequest);
router.get('/mine', requireRole('BENEFICIARY'), getMyVideoCallRequest);
router.get('/pending', requireRole('OFFICER', 'ADMIN'), getPendingVideoCallRequests);
router.get('/:id', getVideoCallRequest);
router.patch('/:id/accept', requireRole('OFFICER', 'ADMIN'), acceptVideoCallRequest);
router.patch('/:id/decline', requireRole('OFFICER', 'ADMIN'), declineVideoCallRequest);

module.exports = router;