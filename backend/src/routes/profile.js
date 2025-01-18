// backend/src/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { body } = require('express-validator');

// Obtener el perfil
router.get('/', profileController.getProfile);

// Actualizar el perfil con validaciones SIMPLIFICADAS TEMPORALMENTE
router.put(
  '/',
  [
    body('name')
      .isLength({ min: 1 })
      .withMessage('El nombre es obligatorio.'),
    body('email')
      .isEmail()
      .withMessage('Formato de email inválido.'),
    body('bio').optional().isString(),
    // Eliminamos la validación custom temporalmente
    // body('profile_picture_url').optional().isString(),
  ],
  profileController.updateProfile
);

module.exports = router;