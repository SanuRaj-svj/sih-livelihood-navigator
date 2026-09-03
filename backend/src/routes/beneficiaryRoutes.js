const express = require('express');
const {
  createOrUpdateProfile,
  getOwnProfile,
  getProfileById,
} = require('../controllers/beneficiaryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/profile', protect, createOrUpdateProfile);
router.get('/profile/me', protect, getOwnProfile);
router.get('/profile/:id', protect, requireRole('OFFICER', 'ADMIN'), getProfileById);

module.exports = router;
