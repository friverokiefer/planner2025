// backend/src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }

  // El token debe tener la forma "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No hay token, autorización denegada" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Se espera que el token tenga la estructura { user: { id, role, ... } }
    if (!decoded || !decoded.user) {
      return res.status(401).json({ msg: "Token mal formado" });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token no válido:", err.message);
    return res.status(401).json({ msg: "Token no válido" });
  }
};

module.exports = authMiddleware;
