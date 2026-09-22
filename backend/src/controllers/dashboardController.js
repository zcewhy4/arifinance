const prisma = require('../utils/prisma');
const { parseDecimal, getCurrentPeriod, getMonthDateRange } = require('../utils/helpers');

// GET /api/dashboard/summary
async function getSummary(req, res, next) {
  try {
    const { month, year } = getCurrentPeriod();
    const { startDate, endDate } = getMonthDateRange(month, year);

    // Total income all time
    const totalIncomeAll = await prisma.income.aggregate({
      where: { userId: req.userId },
      _sum: { amount: true },
    });

    // Total expense all time
    const totalExpenseAll = await prisma.expense.aggregate({
      where: { userId: req.userId },
      _sum: { amount: true },
    });

    // Income this month
    const incomeThisMonth = await prisma.income.aggregate({
      where: {
        userId: req.userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Expense this month
    const expenseThisMonth = await prisma.expense.aggregate({
      where: {
        userId: req.userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Total savings
    const totalSavings = await prisma.savingsGoal.aggregate({
      where: { userId: req.userId },
      _sum: { currentAmount: true },
    });

    // Total investments
    const totalInvestments = await prisma.investment.aggregate({
      where: { userId: req.userId },
      _sum: { currentValue: true },
    });

    // Budget this month
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId, month, year },
    });

    const totalBudget = budgets.reduce((sum, b) => sum + parseDecimal(b.amount), 0);

    const totalIncome = parseDecimal(totalIncomeAll._sum.amount);
    const totalExpense = parseDecimal(totalExpenseAll._sum.amount);
    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        balance,
        incomeThisMonth: parseDecimal(incomeThisMonth._sum.amount),
        expenseThisMonth: parseDecimal(expenseThisMonth._sum.amount),
        totalSavings: parseDecimal(totalSavings._sum.currentAmount),
        totalInvestments: parseDecimal(totalInvestments._sum.currentValue),
        totalBudget,
        budgetUsedThisMonth: parseDecimal(expenseThisMonth._sum.amount),
        budgetRemainingThisMonth: totalBudget - parseDecimal(expenseThisMonth._sum.amount),
        currentMonth: month,
        currentYear: year,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/chart-data
async function getChartData(req, res, next) {
  try {
    const months = [];
    const now = new Date();

    // Get last 6 months data
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const { startDate, endDate } = getMonthDateRange(month, year);

      const [incomeSum, expenseSum] = await Promise.all([
        prisma.income.aggregate({
          where: {
            userId: req.userId,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            userId: req.userId,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

      months.push({
        month: monthNames[month - 1],
        year,
        income: parseDecimal(incomeSum._sum.amount),
        expense: parseDecimal(expenseSum._sum.amount),
      });
    }

    res.json({
      success: true,
      data: { chartData: months },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/category-breakdown
async function getCategoryBreakdown(req, res, next) {
  try {
    const { month, year } = getCurrentPeriod();
    const { startDate, endDate } = getMonthDateRange(month, year);

    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: req.userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Get category names
    const categoryIds = expenses.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = {};
    categories.forEach((c) => { categoryMap[c.id] = c.name; });

    const breakdown = expenses.map((e) => ({
      categoryId: e.categoryId,
      categoryName: categoryMap[e.categoryId] || 'Unknown',
      amount: parseDecimal(e._sum.amount),
    }));

    res.json({
      success: true,
      data: { breakdown },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/recent-transactions
async function getRecentTransactions(req, res, next) {
  try {
    const [recentIncomes, recentExpenses] = await Promise.all([
      prisma.income.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.expense.findMany({
        where: { userId: req.userId },
        include: {
          category: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    // Combine and sort
    const transactions = [
      ...recentIncomes.map((i) => ({
        id: `income-${i.id}`,
        type: 'income',
        description: i.source,
        amount: parseDecimal(i.amount),
        date: i.date,
        category: null,
      })),
      ...recentExpenses.map((e) => ({
        id: `expense-${e.id}`,
        type: 'expense',
        description: e.description,
        amount: parseDecimal(e.amount),
        date: e.date,
        category: e.category?.name || null,
        paymentMethod: e.paymentMethod,
      })),
    ];

    // Sort by date descending, take top 10
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = transactions.slice(0, 10);

    res.json({
      success: true,
      data: { transactions: recent },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSummary, getChartData, getCategoryBreakdown, getRecentTransactions };
