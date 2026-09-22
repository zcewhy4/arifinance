const prisma = require('../utils/prisma');
const { parseDecimal } = require('../utils/helpers');

// GET /api/investments
async function getAll(req, res, next) {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    const investmentsWithPL = investments.map((inv) => {
      const invested = parseDecimal(inv.investedAmount);
      const current = parseDecimal(inv.currentValue);
      const profitLoss = current - invested;
      const profitLossPercentage = invested > 0
        ? ((current - invested) / invested) * 100
        : 0;

      return {
        ...inv,
        investedAmount: invested,
        currentValue: current,
        profitLoss,
        profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
      };
    });

    // Calculate totals
    const totalInvested = investmentsWithPL.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrentValue = investmentsWithPL.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
      : 0;

    res.json({
      success: true,
      data: {
        investments: investmentsWithPL,
        summary: {
          totalInvested,
          totalCurrentValue,
          totalProfitLoss,
          totalProfitLossPercentage: Math.round(totalProfitLossPercentage * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/investments/:id
async function getById(req, res, next) {
  try {
    const investment = await prisma.investment.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investasi tidak ditemukan.',
      });
    }

    const invested = parseDecimal(investment.investedAmount);
    const current = parseDecimal(investment.currentValue);

    res.json({
      success: true,
      data: {
        investment: {
          ...investment,
          investedAmount: invested,
          currentValue: current,
          profitLoss: current - invested,
          profitLossPercentage: invested > 0
            ? Math.round(((current - invested) / invested) * 10000) / 100
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/investments
async function create(req, res, next) {
  try {
    const { assetType, assetName, investedAmount, currentValue, date, note } = req.body;

    const investment = await prisma.investment.create({
      data: {
        userId: req.userId,
        assetType,
        assetName,
        investedAmount,
        currentValue,
        date: new Date(date),
        note: note || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Investasi berhasil ditambahkan!',
      data: {
        investment: {
          ...investment,
          investedAmount: parseDecimal(investment.investedAmount),
          currentValue: parseDecimal(investment.currentValue),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/investments/:id
async function update(req, res, next) {
  try {
    const { assetType, assetName, investedAmount, currentValue, date, note } = req.body;

    const existing = await prisma.investment.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Investasi tidak ditemukan.',
      });
    }

    const investment = await prisma.investment.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assetType: assetType ?? undefined,
        assetName: assetName ?? undefined,
        investedAmount: investedAmount ?? undefined,
        currentValue: currentValue ?? undefined,
        date: date ? new Date(date) : undefined,
        note: note !== undefined ? note : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Investasi berhasil diperbarui!',
      data: {
        investment: {
          ...investment,
          investedAmount: parseDecimal(investment.investedAmount),
          currentValue: parseDecimal(investment.currentValue),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/investments/:id
async function remove(req, res, next) {
  try {
    const existing = await prisma.investment.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Investasi tidak ditemukan.',
      });
    }

    await prisma.investment.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Investasi berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
