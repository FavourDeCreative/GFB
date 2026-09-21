import { Router } from 'express';
import authRoutes from './auth.routes';
import fundRoutes from './fund.routes';
import transactionRoutes from './transaction.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/funds', fundRoutes);
router.use('/transactions', transactionRoutes);
router.use('/admin', adminRoutes);

export default router;
