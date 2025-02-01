// backend/src/controllers/userController.js
const User = require("../models/User");

/**
 * CONTROLADOR de usuarios (solo para ADMIN), con getAll, getById, update, delete
 * NOTA: la creación de usuarios se hace en authController (register).
 */
const userController = {
  /**
   * Listar todos los usuarios
   */
  getAllUsers: async (req, res) => {
    try {
      // OJO: asumes que req.user.role === 'admin' (middleware lo permite).
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error.message);
      res.status(500).json({ msg: "Error del servidor" });
    }
  },

  /**
   * Obtener un usuario por ID
   */
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error al obtener usuario por ID:", error.message);
      res.status(500).json({ msg: "Error del servidor" });
    }
  },

  /**
   * Actualizar usuario (solo admin).
   * - Por simplicidad, solo actualiza "name" en la tabla users.
   * - Si quisieras actualizar "email", adáptalo a tu gusto.
   */
  updateUser: async (req, res) => {
    try {
      const { name } = req.body; // ajusta si deseas actualizar más campos
      if (!name) {
        return res
          .status(400)
          .json({ msg: "Se requiere un nombre para actualizar." });
      }

      const updatedUser = await User.update(req.params.id, { name });
      if (!updatedUser) {
        return res
          .status(404)
          .json({ msg: "Usuario no encontrado o no se actualizó" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar usuario:", error.message);
      res.status(500).json({ msg: "Error del servidor" });
    }
  },

  /**
   * Eliminar usuario (solo admin).
   */
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
      }
      res.json({ msg: "Usuario eliminado" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error.message);
      res.status(500).json({ msg: "Error del servidor" });
    }
  },
};

module.exports = userController;
