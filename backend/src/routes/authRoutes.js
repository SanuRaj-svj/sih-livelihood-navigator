const express = require('express');
const { body } = require('express-validator');
const { register, registerOfficer, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public registration (forced BENEFICIARY role)
router.post('/register', registerValidation, register);

// Admin-only creation of OFFICER or ADMIN accounts
router.post('/register-officer', protect, requireRole('ADMIN'), registerValidation, registerOfficer);

// Login and Profile
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

module.exports = router;
