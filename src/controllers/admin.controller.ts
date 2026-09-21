import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, fundCount, totalInvested, pendingTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.fund.count({ where: { isActive: true } }),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.transaction.count({ where: { status: 'PENDING' } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      userCount,
      fundCount,
      totalInvested: totalInvested._sum.amount || 0,
      pendingTransactions,
    },
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  res.status(200).json({
    success: true,
    data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found.', 404);

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, email: true, isActive: true },
  });

  res.status(200).json({ success: true, data: { user: updated } });
});

export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: status ? { status: status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' } : {},
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where: status ? { status: status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' } : {} }),
  ]);

  res.status(200).json({
    success: true,
    data: { transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const updateTransactionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];

  if (!validStatuses.includes(status)) throw new AppError('Invalid status.', 400);

  const transaction = await prisma.transaction
    .update({ where: { id: req.params.id }, data: { status } })
    .catch(() => null);

  if (!transaction) throw new AppError('Transaction not found.', 404);

  res.status(200).json({ success: true, data: { transaction } });
});
