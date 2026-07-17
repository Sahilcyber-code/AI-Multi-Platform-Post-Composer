import express from 'express';
import { body } from 'express-validator';
import {
  getPublishHistory,
  createPublishHistory,
  deletePublishHistory,
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPublishHistory)
  .post(
    [
      body('post').notEmpty().withMessage('Post content is required'),
      body('platform').notEmpty().withMessage('Platform identifier is required'),
      validate,
    ],
    createPublishHistory
  );

router.route('/:id')
  .delete(deletePublishHistory);

export default router;
