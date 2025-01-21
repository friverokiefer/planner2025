// backend/src/routes/friends.js
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendsController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, query, param } = require('express-validator');

// Todas requieren auth
router.use(authMiddleware);

// Buscar usuarios
router.get(
  '/search',
  [query('query').notEmpty().withMessage('Debe proporcionar un ID o email')],
  friendController.searchUser
);

// Listar amigos
router.get('/list', friendController.getMyFriends);

// Listar solicitudes pendientes
router.get('/requests', friendController.getMyRequests);

// Enviar solicitud
router.post(
  '/send',
  [body('to_user_id').isInt().withMessage('to_user_id debe ser entero')],
  friendController.sendRequest
);

// Aceptar
router.put('/:id/accept', friendController.acceptRequest);

// Rechazar
router.put('/:id/reject', friendController.rejectRequest);

module.exports = router;
