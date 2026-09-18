const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  issueTrainingCredential,
  verifyTrainingCredential,
} = require('../controllers/credentialController');

const router = express.Router();

router.get('/verify/:id', verifyTrainingCredential);
router.post(
  '/training',
  protect,
  requireRole('OFFICER', 'ADMIN'),
  issueTrainingCredential
);

module.exports = router;
