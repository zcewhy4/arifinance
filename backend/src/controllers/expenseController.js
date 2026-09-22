const prisma = require('../utils/prisma');
const { parseDecimal } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

// GET /api/expenses
async function getAll(req, res, next) {
  try {
    const { startDate, endDate, categoryId, paymentMethod, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        expenses: expenses.map((e) => ({
          ...e,
          amount: parseDecimal(e.amount),
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

// GET /api/expenses/:id
async function getById(req, res, next) {
  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Pengeluaran tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: {
        expense: {
          ...expense,
          amount: parseDecimal(expense.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/expenses
async function create(req, res, next) {
  try {
    const { categoryId, amount, paymentMethod, description, date, note } = req.body;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: parseInt(categoryId), userId: req.userId },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak valid.',
      });
    }

    const data = {
      userId: req.userId,
      categoryId: parseInt(categoryId),
      amount,
      paymentMethod,
      description,
      date: new Date(date),
      note: note || null,
    };

    // Handle receipt upload
    if (req.file) {
      data.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    const expense = await prisma.expense.create({
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pengeluaran berhasil ditambahkan!',
      data: {
        expense: {
          ...expense,
          amount: parseDecimal(expense.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/expenses/:id
async function update(req, res, next) {
  try {
    const { categoryId, amount, paymentMethod, description, date, note } = req.body;

    // Check ownership
    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pengeluaran tidak ditemukan.',
      });
    }

    const data = {};

    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({
        where: { id: parseInt(categoryId), userId: req.userId },
      });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak valid.',
        });
      }
      data.categoryId = parseInt(categoryId);
    }

    if (amount !== undefined) data.amount = amount;
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (description !== undefined) data.description = description;
    if (date !== undefined) data.date = new Date(date);
    if (note !== undefined) data.note = note;

    // Handle receipt upload
    if (req.file) {
      // Delete old receipt if exists
      if (existing.receiptUrl) {
        const oldPath = path.join(__dirname, '..', '..', existing.receiptUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      data.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Pengeluaran berhasil diperbarui!',
      data: {
        expense: {
          ...expense,
          amount: parseDecimal(expense.amount),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/expenses/:id
async function remove(req, res, next) {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pengeluaran tidak ditemukan.',
      });
    }

    // Delete receipt file if exists
    if (existing.receiptUrl) {
      const filePath = path.join(__dirname, '..', '..', existing.receiptUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.expense.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Pengeluaran berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
