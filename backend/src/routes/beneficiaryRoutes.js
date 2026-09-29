const express = require('express');
const {
  createOrUpdateProfile,
  getOwnProfile,
  getProfileById,
  getIncompleteProfiles,
  requestProfileCorrection,
} = require('../controllers/beneficiaryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/profile', protect, createOrUpdateProfile);
router.get('/profile/me', protect, getOwnProfile);
router.get('/profiles/incomplete', protect, requireRole('OFFICER', 'ADMIN'), getIncompleteProfiles);
router.post('/profile/:id/correction-requests', protect, requireRole('OFFICER', 'ADMIN'), requestProfileCorrection);
router.get('/profile/:id', protect, requireRole('OFFICER', 'ADMIN'), getProfileById);

module.exports = router;
