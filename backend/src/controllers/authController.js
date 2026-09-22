const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const DEFAULT_EXPENSE_CATEGORIES = [
  'Bensin', 'Makan', 'Minuman', 'ShopeeFood', 'Parkir',
  'Transportasi', 'Kebutuhan Kuliah', 'Nongkrong', 'Belanja', 'Lainnya',
];

const DEFAULT_INCOME_CATEGORIES = [
  'Uang Saku', 'Gaji', 'Freelance', 'Lainnya',
];

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default categories for the new user
    const categoryData = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
        userId: user.id,
        name,
        type: 'expense',
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
        userId: user.id,
        name,
        type: 'income',
      })),
    ];

    await prisma.category.createMany({ data: categoryData });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password lama harus diisi untuk mengubah password.',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan.',
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Password lama tidak sesuai.',
        });
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me, updateProfile };
