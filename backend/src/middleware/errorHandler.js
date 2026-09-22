/**
 * Global error handling middleware
 * Tidak menampilkan stack trace kepada user
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada. Duplikasi tidak diperbolehkan.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Data tidak ditemukan.',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Referensi data tidak valid.',
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran file terlalu besar. Maksimal 5MB.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Field upload tidak sesuai.',
    });
  }

  // Validation errors (express-validator)
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal.',
      errors: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token sudah kadaluarsa.',
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Terjadi kesalahan pada server.';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
