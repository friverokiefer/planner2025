// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Espera "Authorization: Bearer <token>"
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }

  // Descomponer la cabecera si lleva la palabra "Bearer"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
    req.user = decoded.user; 
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};
