const prisma = require('../utils/prisma');
const { parseDecimal, getMonthDateRange } = require('../utils/helpers');

// GET /api/budgets
async function getAll(req, res, next) {
  try {
    const { month, year } = req.query;
    const where = { userId: req.userId };

    if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { category: { name: 'asc' } },
    });

    // Calculate budget usage for each budget
    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const { startDate, endDate } = getMonthDateRange(budget.month, budget.year);

        const expenseSum = await prisma.expense.aggregate({
          where: {
            userId: req.userId,
            categoryId: budget.categoryId,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const budgetAmount = parseDecimal(budget.amount);
        const budgetUsed = parseDecimal(expenseSum._sum.amount);
        const budgetRemaining = budgetAmount - budgetUsed;
        const percentageUsed = budgetAmount > 0 ? (budgetUsed / budgetAmount) * 100 : 0;

        let status = 'normal';
        if (percentageUsed > 90) status = 'danger';
        else if (percentageUsed >= 70) status = 'warning';

        return {
          ...budget,
          amount: budgetAmount,
          budgetUsed,
          budgetRemaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          status,
        };
      })
    );

    res.json({
      success: true,
      data: { budgets: budgetsWithUsage },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/budgets
async function create(req, res, next) {
  try {
    const { categoryId, amount, month, year } = req.body;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: parseInt(categoryId), userId: req.userId, type: 'expense' },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak valid. Hanya kategori pengeluaran yang dapat diberi budget.',
      });
    }

    // Check if budget already exists for this category/month/year
    const existing = await prisma.budget.findFirst({
      where: {
        userId: req.userId,
        categoryId: parseInt(categoryId),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Budget untuk kategori ini di bulan tersebut sudah ada.',
      });
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.userId,
        categoryId: parseInt(categoryId),
        amount,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Budget berhasil ditambahkan!',
      data: {
        budget: {
          ...budget,
          amount: parseDecimal(budget.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/budgets/:id
async function update(req, res, next) {
  try {
    const { amount } = req.body;

    const existing = await prisma.budget.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Budget tidak ditemukan.',
      });
    }

    const budget = await prisma.budget.update({
      where: { id: parseInt(req.params.id) },
      data: { amount },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Budget berhasil diperbarui!',
      data: {
        budget: {
          ...budget,
          amount: parseDecimal(budget.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/budgets/:id
async function remove(req, res, next) {
  try {
    const existing = await prisma.budget.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Budget tidak ditemukan.',
      });
    }

    await prisma.budget.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Budget berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
