const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Attaches userId to req object
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa. Silakan login kembali.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }
}

module.exports = authMiddleware;
