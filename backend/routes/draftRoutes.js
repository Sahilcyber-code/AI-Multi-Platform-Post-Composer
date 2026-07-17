import express from 'express';
import { body } from 'express-validator';
import {
  getDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  toggleFavouriteDraft,
  duplicateDraft,
  deleteAllDrafts,
} from '../controllers/draftController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDrafts)
  .post(
    [
      body('title').notEmpty().withMessage('Draft title is required').trim(),
      validate,
    ],
    createDraft
  )
  .delete(deleteAllDrafts);

router.route('/:id')
  .put(updateDraft)
  .delete(deleteDraft);

router.post('/:id/favourite', toggleFavouriteDraft);
router.post('/:id/duplicate', duplicateDraft);

export default router;
