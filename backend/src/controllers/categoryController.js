const prisma = require('../utils/prisma');

// GET /api/categories
async function getAll(req, res, next) {
  try {
    const { type } = req.query;
    const where = { userId: req.userId };

    if (type) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/categories
async function create(req, res, next) {
  try {
    const { name, type } = req.body;

    const category = await prisma.category.create({
      data: {
        userId: req.userId,
        name,
        type,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan!',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/categories/:id
async function update(req, res, next) {
  try {
    const { name, type } = req.body;

    const existing = await prisma.category.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: name ?? undefined,
        type: type ?? undefined,
      },
    });

    res.json({
      success: true,
      message: 'Kategori berhasil diperbarui!',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/categories/:id
async function remove(req, res, next) {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.',
      });
    }

    // Check if category is used by expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId: parseInt(req.params.id) },
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena digunakan oleh ${expenseCount} pengeluaran.`,
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({
      success: true,
      message: 'Kategori berhasil dihapus!',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
