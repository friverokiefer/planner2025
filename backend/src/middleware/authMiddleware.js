// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  // Ejemplo: Bearer abcdef123...
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  // Debug: mirar qué token está llegando
  console.log('authMiddleware => Token recibido:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
    // console.log('authMiddleware => Decoded payload:', decoded);
    req.user = decoded.user; 
    next();
  } catch (err) {
    console.error('authMiddleware => jwt.verify error:', err.message);
    return res.status(401).json({ msg: 'Token no válido' });
  }
};
