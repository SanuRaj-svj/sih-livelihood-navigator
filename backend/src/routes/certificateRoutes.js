const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  issueCertificate,
  verifyCertificate,
  unlockEnrollment,
  downloadCertificatePdf,
  getPendingCertificateApprovals,
} = require('../controllers/certificateController');

const router = express.Router();

router.get('/verify/:certificateId', verifyCertificate);
router.get('/download/:certificateId', downloadCertificatePdf);
router.get('/pending', protect, requireRole('OFFICER', 'ADMIN'), getPendingCertificateApprovals);
router.post('/unlock', protect, unlockEnrollment);
router.post('/:enrollmentId/issue', protect, requireRole('OFFICER', 'ADMIN'), issueCertificate);
router.post('/:enrollmentId/approve', protect, requireRole('OFFICER', 'ADMIN'), issueCertificate);

module.exports = router;
