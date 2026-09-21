import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createFundSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  minInvestment: z.number().positive(),
  expectedReturn: z.number().positive(),
  currency: z.string().default('USD'),
});

export const createTransactionSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'RETURN']),
  amount: z.number().positive(),
  metadata: z.record(z.any()).optional(),
});

export const investSchema = z.object({
  fundId: z.string().uuid(),
  amount: z.number().positive(),
});
