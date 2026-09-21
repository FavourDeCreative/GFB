import { Router } from 'express';
import {
  createTransaction, getMyTransactions, getTransactionById,
} from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTransactionSchema } from '../utils/validators';

const router = Router();

router.use(protect);

router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/', getMyTransactions);
router.get('/:id', getTransactionById);

export default router;
