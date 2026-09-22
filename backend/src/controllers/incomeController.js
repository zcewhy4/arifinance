const prisma = require('../utils/prisma');
const { parseDecimal } = require('../utils/helpers');

// GET /api/income
async function getAll(req, res, next) {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.income.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        incomes: incomes.map((i) => ({
          ...i,
          amount: parseDecimal(i.amount),
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/income/:id
async function getById(req, res, next) {
  try {
    const income = await prisma.income.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId,
      },
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Pemasukan tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: {
        income: {
          ...income,
          amount: parseDecimal(income.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/income
async function create(req, res, next) {
  try {
    const { amount, source, date, note } = req.body;

    const income = await prisma.income.create({
      data: {
        userId: req.userId,
        amount,
        source,
        date: new Date(date),
        note: note || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pemasukan berhasil ditambahkan!',
      data: {
        income: {
          ...income,
          amount: parseDecimal(income.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/income/:id
async function update(req, res, next) {
  try {
    const { amount, source, date, note } = req.body;

    // Check ownership
    const existing = await prisma.income.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pemasukan tidak ditemukan.',
      });
    }

    const income = await prisma.income.update({
      where: { id: parseInt(req.params.id) },
      data: {
        amount: amount ?? undefined,
        source: source ?? undefined,
        date: date ? new Date(date) : undefined,
        note: note !== undefined ? note : undefined,
      },
    });

    res.json({
      success: true,
      message: 'Pemasukan berhasil diperbarui!',
      data: {
        income: {
          ...income,
          amount: parseDecimal(income.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/income/:id
async function remove(req, res, next) {
  try {
    // Check ownership
    const existing = await prisma.income.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pemasukan tidak ditemukan.',
      });
    }

    await prisma.income.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Pemasukan berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
