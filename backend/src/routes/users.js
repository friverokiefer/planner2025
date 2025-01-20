// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todos los usuarios (protegida, solo para administradores)
router.get('/', authMiddleware, userController.getAllUsers);

// Obtener un usuario por ID (protegida, solo para administradores)
router.get('/:id', authMiddleware, userController.getUserById);

// Actualizar un usuario (protegida, solo para administradores)
router.put('/:id', authMiddleware, userController.updateUser);

// Eliminar un usuario (protegida, solo para administradores)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;