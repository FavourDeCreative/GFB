import { Request, Response } from 'express';
import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const getFunds = asyncHandler(async (req: Request, res: Response) => {
  const { category, riskLevel } = req.query;

  const funds = await prisma.fund.findMany({
    where: {
      isActive: true,
      ...(category && { category: String(category) }),
      ...(riskLevel && { riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' }),
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: { funds } });
});

export const getFundBySlug = asyncHandler(async (req: Request, res: Response) => {
  const fund = await prisma.fund.findUnique({ where: { slug: req.params.slug } });

  if (!fund) throw new AppError('Fund not found.', 404);

  res.status(200).json({ success: true, data: { fund } });
});

export const createFund = asyncHandler(async (req: Request, res: Response) => {
  const fund = await prisma.fund.create({ data: req.body });
  res.status(201).json({ success: true, data: { fund } });
});

export const updateFund = asyncHandler(async (req: Request, res: Response) => {
  const fund = await prisma.fund
    .update({ where: { id: req.params.id }, data: req.body })
    .catch(() => null);

  if (!fund) throw new AppError('Fund not found.', 404);

  res.status(200).json({ success: true, data: { fund } });
});

export const deleteFund = asyncHandler(async (req: Request, res: Response) => {
  await prisma.fund
    .update({ where: { id: req.params.id }, data: { isActive: false } })
    .catch(() => {
      throw new AppError('Fund not found.', 404);
    });

  res.status(204).send();
});

export const investInFund = asyncHandler(async (req: Request, res: Response) => {
  const { fundId, amount } = req.body;

  const fund = await prisma.fund.findUnique({ where: { id: fundId } });
  if (!fund || !fund.isActive) throw new AppError('Fund not found.', 404);

  if (amount < Number(fund.minInvestment)) {
    throw new AppError(`Minimum investment for this fund is ${fund.minInvestment} ${fund.currency}.`, 400);
  }

  const [investment] = await prisma.$transaction([
    prisma.investment.create({
      data: { userId: req.user!.userId, fundId, amount },
    }),
    prisma.transaction.create({
      data: {
        userId: req.user!.userId,
        type: 'INVESTMENT',
        amount,
        status: 'COMPLETED',
        metadata: { fundId, fundName: fund.name },
      },
    }),
  ]);

  res.status(201).json({ success: true, data: { investment } });
});
