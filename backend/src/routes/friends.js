// backend/src/routes/friends.js
const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, query, param } = require('express-validator');

// Todas requieren auth
router.use(authMiddleware);

// Buscar usuarios
router.get(
  '/search',
  [query('query').notEmpty().withMessage('Debe proporcionar un ID o email')],
  friendsController.searchUser
);

// Listar amigos
router.get('/list', friendsController.getMyFriends);

// Listar solicitudes pendientes
router.get('/requests', friendsController.getMyRequests);

// Enviar solicitud
router.post(
  '/send',
  [body('to_user_id').isInt().withMessage('to_user_id debe ser entero')],
  friendsController.sendRequest
);

// Aceptar
router.put(
  '/:id/accept',
  [param('id').isInt().withMessage('ID de solicitud debe ser un entero')],
  friendsController.acceptRequest
);

// Rechazar
router.put(
  '/:id/reject',
  [param('id').isInt().withMessage('ID de solicitud debe ser un entero')],
  friendsController.rejectRequest
);

module.exports = router;
