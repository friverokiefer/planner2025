// backend/src/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Proteger rutas
router.use(authMiddleware);

// Obtener el perfil
router.get('/', profileController.getProfile);

// Actualizar el perfil
router.put(
  '/',
  [
    body('name').isLength({ min: 1 }).withMessage('El nombre es obligatorio.'),
    body('bio').optional().isString(),
    body('profile_picture_url').optional().isString(),
  ],
  profileController.updateProfile
);

module.exports = router;
