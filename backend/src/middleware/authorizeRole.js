// backend/src/middleware/authorizeRole.js

module.exports = function (requiredRole) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res
        .status(403)
        .json({ msg: "Acceso denegado: Sin información de rol." });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ msg: "Acceso denegado: Rol insuficiente." });
    }

    next();
  };
};
