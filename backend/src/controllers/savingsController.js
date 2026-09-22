const prisma = require('../utils/prisma');
const { parseDecimal } = require('../utils/helpers');

// GET /api/savings
async function getAll(req, res, next) {
  try {
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        savingsGoals: savingsGoals.map((s) => {
          const target = parseDecimal(s.targetAmount);
          const current = parseDecimal(s.currentAmount);
          const percentage = target > 0 ? (current / target) * 100 : 0;

          return {
            ...s,
            targetAmount: target,
            currentAmount: current,
            progressPercentage: Math.round(percentage * 100) / 100,
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/savings/:id
async function getById(req, res, next) {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Target tabungan tidak ditemukan.',
      });
    }

    const target = parseDecimal(goal.targetAmount);
    const current = parseDecimal(goal.currentAmount);

    res.json({
      success: true,
      data: {
        savingsGoal: {
          ...goal,
          targetAmount: target,
          currentAmount: current,
          progressPercentage: target > 0 ? Math.round((current / target) * 10000) / 100 : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/savings
async function create(req, res, next) {
  try {
    const { name, targetAmount, currentAmount, deadline, note } = req.body;

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: req.userId,
        name,
        targetAmount,
        currentAmount: currentAmount || 0,
        deadline: deadline ? new Date(deadline) : null,
        note: note || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Target tabungan berhasil dibuat!',
      data: {
        savingsGoal: {
          ...goal,
          targetAmount: parseDecimal(goal.targetAmount),
          currentAmount: parseDecimal(goal.currentAmount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/savings/:id
async function update(req, res, next) {
  try {
    const { name, targetAmount, currentAmount, deadline, note } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Target tabungan tidak ditemukan.',
      });
    }

    const goal = await prisma.savingsGoal.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name ?? undefined,
        targetAmount: targetAmount ?? undefined,
        currentAmount: currentAmount ?? undefined,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
        note: note !== undefined ? note : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Target tabungan berhasil diperbarui!',
      data: {
        savingsGoal: {
          ...goal,
          targetAmount: parseDecimal(goal.targetAmount),
          currentAmount: parseDecimal(goal.currentAmount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/savings/:id/add
async function addAmount(req, res, next) {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah harus lebih dari 0.',
      });
    }

    const existing = await prisma.savingsGoal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Target tabungan tidak ditemukan.',
      });
    }

    const newAmount = parseDecimal(existing.currentAmount) + parseFloat(amount);

    const goal = await prisma.savingsGoal.update({
      where: { id: parseInt(req.params.id) },
      data: { currentAmount: newAmount },
    });

    res.json({
      success: true,
      message: 'Tabungan berhasil ditambahkan!',
      data: {
        savingsGoal: {
          ...goal,
          targetAmount: parseDecimal(goal.targetAmount),
          currentAmount: parseDecimal(goal.currentAmount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/savings/:id
async function remove(req, res, next) {
  try {
    const existing = await prisma.savingsGoal.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Target tabungan tidak ditemukan.',
      });
    }

    await prisma.savingsGoal.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Target tabungan berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, addAmount, remove };
