import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Register router
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    validate,
  ],
  registerUser
);

// Login router
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  loginUser
);

// Logout router
router.post('/logout', logoutUser);

// Get current logged-in user profile
router.get('/me', protect, getMe);

// Forgot Password request
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    validate,
  ],
  forgotPassword
);

// Reset Password confirmation
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validate,
  ],
  resetPassword
);

export default router;
