import express from 'express';
import { body } from 'express-validator';
import { generateAISuggestions } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.post(
  '/generate',
  [
    body('text').notEmpty().withMessage('Source text is required'),
    body('option').notEmpty().withMessage('AI modification option is required'),
    validate,
  ],
  generateAISuggestions
);

export default router;
