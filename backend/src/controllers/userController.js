// backend/src/controllers/userController.js
const User = require('../models/User');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },

  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },

  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json({ msg: 'Usuario eliminado' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Error del servidor');
    }
  },
};

module.exports = userController;