import { Router } from 'express';
import {
  getDashboardStats, getAllUsers, toggleUserStatus,
  getAllTransactions, updateTransactionStatus,
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, restrictTo('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/transactions', getAllTransactions);
router.patch('/transactions/:id/status', updateTransactionStatus);

export default router;
