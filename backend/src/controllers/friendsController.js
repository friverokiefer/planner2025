// backend/src/controllers/friendsController.js

const Friend = require('../models/Friend'); // Asegúrate de que el nombre del archivo coincide
const { validationResult } = require('express-validator');

const friendsController = {
  // Enviar solicitud de amistad
  sendRequest: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const fromUserId = req.user.id;
      const { to_user_id } = req.body;
      if (fromUserId === to_user_id) {
        return res.status(400).json({ error: 'No puedes enviarte una solicitud de amistad a ti mismo.' });
      }
      const friendReq = await Friend.sendRequest(fromUserId, to_user_id);

      if (!friendReq) {
        return res
          .status(400)
          .json({ error: 'Ya existe una solicitud o amistad con ese usuario.' });
      }
      res.json(friendReq);
    } catch (error) {
      console.error('Error al enviar solicitud de amistad:', error);
      res.status(500).json({ error: 'Error al enviar solicitud de amistad' });
    }
  },

  // Aceptar solicitud
  acceptRequest: async (req, res) => {
    try {
      const friendReqId = req.params.id;
      const userId = req.user.id;
      const updated = await Friend.acceptRequest(friendReqId, userId);
      if (!updated) {
        return res.status(404).json({
          error: 'Solicitud no encontrada o no eres el destinatario.',
        });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      res.status(500).json({ error: 'Error al aceptar solicitud' });
    }
  },

  // Rechazar solicitud
  rejectRequest: async (req, res) => {
    try {
      const friendReqId = req.params.id;
      const userId = req.user.id;
      const updated = await Friend.rejectRequest(friendReqId, userId);
      if (!updated) {
        return res.status(404).json({
          error: 'Solicitud no encontrada o no eres el destinatario.',
        });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
  },

  // Lista de amigos (aceptados)
  getMyFriends: async (req, res) => {
    try {
      const userId = req.user.id;
      const friends = await Friend.getFriendsOfUser(userId);
      res.json(friends);
    } catch (error) {
      console.error('Error al obtener amigos:', error);
      res.status(500).json({ error: 'Error al obtener amigos' });
    }
  },

  // Lista de solicitudes pendientes
  getMyRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await Friend.getRequestsForUser(userId);
      res.json(requests);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
  },

  // Buscar usuario por email o id
  searchUser: async (req, res) => {
    try {
      const { query } = req.query; // ?query=...
      if (!query) return res.json([]);
      const users = await Friend.findUserByEmailOrId(query);
      res.json(users);
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ error: 'Error al buscar usuario' });
    }
  },
};

module.exports = friendsController;
