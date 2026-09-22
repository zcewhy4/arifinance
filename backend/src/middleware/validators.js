const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

// Auth validators
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama harus diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password harus diisi.')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password harus diisi.'),
  validate,
];

// Income validators
const incomeValidator = [
  body('amount')
    .notEmpty().withMessage('Jumlah harus diisi.')
    .isFloat({ min: 1 }).withMessage('Jumlah harus lebih dari 0.'),
  body('source')
    .trim()
    .notEmpty().withMessage('Sumber pemasukan harus diisi.')
    .isLength({ max: 255 }).withMessage('Sumber maksimal 255 karakter.'),
  body('date')
    .notEmpty().withMessage('Tanggal harus diisi.')
    .isISO8601().withMessage('Format tanggal tidak valid.'),
  body('note')
    .optional()
    .trim(),
  validate,
];

// Income update validators (all fields optional, but validated when present)
const incomeUpdateValidator = [
  body('amount')
    .optional()
    .notEmpty().withMessage('Jumlah harus diisi.')
    .isFloat({ min: 1 }).withMessage('Jumlah harus lebih dari 0.'),
  body('source')
    .optional()
    .trim()
    .notEmpty().withMessage('Sumber pemasukan harus diisi.')
    .isLength({ max: 255 }).withMessage('Sumber maksimal 255 karakter.'),
  body('date')
    .optional()
    .notEmpty().withMessage('Tanggal harus diisi.')
    .isISO8601().withMessage('Format tanggal tidak valid.'),
  body('note')
    .optional()
    .trim(),
  validate,
];

// Expense validators
const expenseValidator = [
  body('categoryId')
    .notEmpty().withMessage('Kategori harus dipilih.')
    .isInt({ min: 1 }).withMessage('Kategori tidak valid.'),
  body('amount')
    .notEmpty().withMessage('Jumlah harus diisi.')
    .isFloat({ min: 1 }).withMessage('Jumlah harus lebih dari 0.'),
  body('paymentMethod')
    .trim()
    .notEmpty().withMessage('Metode pembayaran harus dipilih.')
    .isIn(['Cash', 'QRIS', 'Transfer', 'E-Wallet', 'Debit']).withMessage('Metode pembayaran tidak valid.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Deskripsi harus diisi.')
    .isLength({ max: 255 }).withMessage('Deskripsi maksimal 255 karakter.'),
  body('date')
    .notEmpty().withMessage('Tanggal harus diisi.')
    .isISO8601().withMessage('Format tanggal tidak valid.'),
  body('note')
    .optional()
    .trim(),
  validate,
];

// Budget validators
const budgetValidator = [
  body('categoryId')
    .notEmpty().withMessage('Kategori harus dipilih.')
    .isInt({ min: 1 }).withMessage('Kategori tidak valid.'),
  body('amount')
    .notEmpty().withMessage('Jumlah budget harus diisi.')
    .isFloat({ min: 1 }).withMessage('Jumlah budget harus lebih dari 0.'),
  body('month')
    .notEmpty().withMessage('Bulan harus diisi.')
    .isInt({ min: 1, max: 12 }).withMessage('Bulan harus 1-12.'),
  body('year')
    .notEmpty().withMessage('Tahun harus diisi.')
    .isInt({ min: 2020, max: 2100 }).withMessage('Tahun tidak valid.'),
  validate,
];

// Savings validators
const savingsValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama target harus diisi.')
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter.'),
  body('targetAmount')
    .notEmpty().withMessage('Target jumlah harus diisi.')
    .isFloat({ min: 1 }).withMessage('Target harus lebih dari 0.'),
  body('currentAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Jumlah terkumpul tidak boleh negatif.'),
  body('deadline')
    .optional()
    .isISO8601().withMessage('Format deadline tidak valid.'),
  body('note')
    .optional()
    .trim(),
  validate,
];

// Investment validators
const investmentValidator = [
  body('assetType')
    .trim()
    .notEmpty().withMessage('Jenis aset harus diisi.')
    .isLength({ max: 100 }).withMessage('Jenis aset maksimal 100 karakter.'),
  body('assetName')
    .trim()
    .notEmpty().withMessage('Nama aset harus diisi.')
    .isLength({ max: 255 }).withMessage('Nama aset maksimal 255 karakter.'),
  body('investedAmount')
    .notEmpty().withMessage('Modal harus diisi.')
    .isFloat({ min: 0 }).withMessage('Modal tidak boleh negatif.'),
  body('currentValue')
    .notEmpty().withMessage('Nilai saat ini harus diisi.')
    .isFloat({ min: 0 }).withMessage('Nilai tidak boleh negatif.'),
  body('date')
    .notEmpty().withMessage('Tanggal harus diisi.')
    .isISO8601().withMessage('Format tanggal tidak valid.'),
  body('note')
    .optional()
    .trim(),
  validate,
];

// Category validators
const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama kategori harus diisi.')
    .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter.'),
  body('type')
    .trim()
    .notEmpty().withMessage('Tipe harus diisi.')
    .isIn(['income', 'expense']).withMessage('Tipe harus income atau expense.'),
  validate,
];

// ID param validator
const idParamValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID tidak valid.'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  incomeValidator,
  incomeUpdateValidator,
  expenseValidator,
  budgetValidator,
  savingsValidator,
  investmentValidator,
  categoryValidator,
  idParamValidator,
};
