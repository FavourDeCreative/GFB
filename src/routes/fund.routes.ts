import { Router } from 'express';
import {
  getFunds, getFundBySlug, createFund, updateFund, deleteFund, investInFund,
} from '../controllers/fund.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createFundSchema, investSchema } from '../utils/validators';

const router = Router();

router.get('/', getFunds);
router.get('/:slug', getFundBySlug);
router.post('/invest', protect, validate(investSchema), investInFund);

router.post('/', protect, restrictTo('ADMIN'), validate(createFundSchema), createFund);
router.patch('/:id', protect, restrictTo('ADMIN'), updateFund);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteFund);

export default router;
