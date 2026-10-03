import { Request, Response } from "express";
import prisma from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Authentication required.", 401);
    }

    const [
      user,
      investmentTotal,
      returnTotal,
      investmentCount,
      transactionCount,
      investments,
      recentTransactions,
    ] = await Promise.all([
      // User
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),

      // Total completed investments
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INVESTMENT",
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      // Total completed returns
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "RETURN",
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),

      // Number of investments
      prisma.investment.count({
        where: {
          userId,
        },
      }),

      // Number of transactions
      prisma.transaction.count({
        where: {
          userId,
        },
      }),

      // User investments
      prisma.investment.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          fund: true,
        },
      }),

      // Latest transactions
      prisma.transaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    if (!user) {
      throw new AppError("User account not found.", 404);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated.", 403);
    }

    const totalInvested = Number(investmentTotal._sum.amount ?? 0);

    const totalProfit = Number(returnTotal._sum.amount ?? 0);

    /*
     * Current schema does not have a live market-value field.
     *
     * Therefore, for now:
     * portfolioValue = total invested + completed returns
     */
    const portfolioValue = totalInvested + totalProfit;

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          portfolioValue,
          totalInvested,
          totalProfit,
          investmentCount,
          transactionCount,
        },
        investments,
        recentTransactions,
      },
    });
  },
);
