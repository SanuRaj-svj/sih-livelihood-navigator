const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getDashboardSummary,
  getSkillDemand,
  getAtRisk,
} = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.use(requireRole('OFFICER', 'ADMIN'));

router.get('/summary', getDashboardSummary);
router.get('/skill-demand', getSkillDemand);
router.get('/at-risk', getAtRisk);

module.exports = router;
