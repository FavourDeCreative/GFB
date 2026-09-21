import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { type, amount, metadata } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.user!.userId,
      type,
      amount,
      metadata,
      status: 'PENDING',
    },
  });

  res.status(201).json({ success: true, data: { transaction } });
});

export const getMyTransactions = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId: req.user!.userId } }),
  ]);

  res.status(200).json({
    success: true,
    data: { transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!transaction) throw new AppError('Transaction not found.', 404);

  res.status(200).json({ success: true, data: { transaction } });
});
