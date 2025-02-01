const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole"); // Nuevo Middleware

// Aplica ambos middlewares: primero autenticación, luego autorización
router.use(authMiddleware);
router.use(authorizeRole("superadmin")); // Requiere rol 'superadmin'

// GET /api/superadmin/users-extended
router.get("/users-extended", superAdminController.getUsersExtended);

module.exports = router;
