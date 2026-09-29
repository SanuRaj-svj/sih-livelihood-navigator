const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  uploadSourceCertificate,
  getMyDocuments,
  getPendingDocuments,
  reviewSourceCertificate,
  downloadSourceCertificate,
} = require('../controllers/beneficiaryDocumentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, done) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP document images are accepted');
      error.statusCode = 400;
      return done(error);
    }
    return done(null, true);
  },
});

const router = express.Router();
router.use(protect);
router.post('/source-certificates', upload.single('document'), uploadSourceCertificate);
router.get('/mine', getMyDocuments);
router.get('/pending', requireRole('OFFICER', 'ADMIN'), getPendingDocuments);
router.patch('/:id/review', requireRole('OFFICER', 'ADMIN'), reviewSourceCertificate);
router.get('/:id/file', downloadSourceCertificate);

module.exports = router;