const prisma = require('../utils/prisma');
const { parseDecimal } = require('../utils/helpers');

// GET /api/reports
async function getReport(req, res, next) {
  try {
    const { startDate, endDate, categoryId, paymentMethod, period } = req.query;

    // Default to current month
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Income in range
    const incomeWhere = {
      userId: req.userId,
      date: { gte: start, lte: end },
    };

    const incomes = await prisma.income.findMany({
      where: incomeWhere,
      orderBy: { date: 'desc' },
    });

    const totalIncome = incomes.reduce((sum, i) => sum + parseDecimal(i.amount), 0);

    // Expense in range
    const expenseWhere = {
      userId: req.userId,
      date: { gte: start, lte: end },
    };

    if (categoryId) {
      expenseWhere.categoryId = parseInt(categoryId);
    }

    if (paymentMethod) {
      expenseWhere.paymentMethod = paymentMethod;
    }

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalExpense = expenses.reduce((sum, e) => sum + parseDecimal(e.amount), 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach((e) => {
      const catName = e.category?.name || 'Lainnya';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = 0;
      }
      categoryBreakdown[catName] += parseDecimal(e.amount);
    });

    // Sort by amount descending
    const sortedCategories = Object.entries(categoryBreakdown)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Payment method breakdown
    const paymentBreakdown = {};
    expenses.forEach((e) => {
      if (!paymentBreakdown[e.paymentMethod]) {
        paymentBreakdown[e.paymentMethod] = 0;
      }
      paymentBreakdown[e.paymentMethod] += parseDecimal(e.amount);
    });

    const sortedPayments = Object.entries(paymentBreakdown)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Combine transactions
    const transactions = [
      ...incomes.map((i) => ({
        id: i.id,
        type: 'income',
        description: i.source,
        amount: parseDecimal(i.amount),
        date: i.date,
        category: null,
        paymentMethod: null,
        note: i.note,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        type: 'expense',
        description: e.description,
        amount: parseDecimal(e.amount),
        date: e.date,
        category: e.category?.name || null,
        paymentMethod: e.paymentMethod,
        note: e.note,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Daily breakdown (if period is daily)
    let dailyData = [];
    if (period === 'daily') {
      const dailyMap = {};
      transactions.forEach((t) => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          dailyMap[dateKey].income += t.amount;
        } else {
          dailyMap[dateKey].expense += t.amount;
        }
      });
      dailyData = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          topCategory: sortedCategories[0] || null,
          transactionCount: transactions.length,
        },
        categoryBreakdown: sortedCategories,
        paymentBreakdown: sortedPayments,
        transactions,
        dailyData,
        period: {
          startDate: start,
          endDate: end,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/export
async function exportCSV(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId: req.userId,
          date: { gte: start, lte: end },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.expense.findMany({
        where: {
          userId: req.userId,
          date: { gte: start, lte: end },
        },
        include: {
          category: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Build CSV
    const rows = [
      ['Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Metode Pembayaran', 'Jumlah', 'Catatan'],
    ];

    incomes.forEach((i) => {
      rows.push([
        new Date(i.date).toLocaleDateString('id-ID'),
        'Pemasukan',
        i.source,
        '-',
        '-',
        parseDecimal(i.amount),
        i.note || '',
      ]);
    });

    expenses.forEach((e) => {
      rows.push([
        new Date(e.date).toLocaleDateString('id-ID'),
        'Pengeluaran',
        e.description,
        e.category?.name || '-',
        e.paymentMethod,
        parseDecimal(e.amount),
        e.note || '',
      ]);
    });

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-arifinance-${start.toISOString().split('T')[0]}.csv`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 support
  } catch (error) {
    next(error);
  }
}

module.exports = { getReport, exportCSV };
