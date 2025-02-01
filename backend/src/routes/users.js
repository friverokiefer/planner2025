// backend/src/routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Aplicar middleware a todas las rutas
router.use(authMiddleware);

// Obtener todos los usuarios (solo admin)
router.get("/", userController.getAllUsers);

// Obtener un usuario por ID (solo admin)
router.get("/:id", userController.getUserById);

// Actualizar un usuario (solo admin)
router.put("/:id", userController.updateUser);

// Eliminar un usuario (solo admin)
router.delete("/:id", userController.deleteUser);

module.exports = router;
