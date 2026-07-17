import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth protection to all user routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(upload.single('profileImage'), updateUserProfile);

router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    validate,
  ],
  changeUserPassword
);

router.delete('/', deleteUserAccount);

export default router;
