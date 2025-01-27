// backend/src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('AuthMiddleware: No hay token');
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('AuthMiddleware => jwt.verify error:', err.message);
    return res.status(401).json({ msg: 'Token no válido' });
  }
};
