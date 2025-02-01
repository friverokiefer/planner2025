// backend/src/controllers/profileController.js

const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Profile = require("../models/profile");
const User = require("../models/User");

const profileController = {
  /**
   * GET /api/profile
   * Retorna el perfil del usuario logueado, o si no existe en "profiles",
   * retorna datos básicos desde la tabla "users".
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ error: "No se encontró ID de usuario en el token" });
      }

      // Buscar si existe profile en la tabla
      const profile = await Profile.getByUserId(userId);

      if (!profile) {
        // No existe => retornamos info básica de "users"
        const userData = await User.findById(userId);
        if (!userData) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.json({
          user_id: userId,
          name: userData.name,
          email: userData.email,
          bio: "",
          profile_picture_url: "",
        });
      } else {
        // Existe profile en la BD
        return res.json(profile);
      }
    } catch (error) {
      console.error("Error al obtener el perfil:", error);
      res.status(500).json({ error: "Error al obtener el perfil" });
    }
  },

  /**
   * PUT /api/profile
   * Actualiza (o crea) el perfil.
   * Si el profile_picture_url cambió, borra la imagen anterior.
   */
  updateProfile: async (req, res) => {
    // Para ver si hay validaciones
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(
        "ProfileController.updateProfile: Errores de validación",
        errors.array(),
      );
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // Log para depurar
      console.log("[updateProfile] BODY RECIBIDO:", req.body);

      const { name, bio, profile_picture_url } = req.body;

      // 1) Obtener el perfil actual para ver si hay que borrar la imagen anterior
      const existingProfile = await Profile.getByUserId(userId);

      // 2) Si existe y la "profile_picture_url" es distinta & no vacía => borrar anterior
      if (
        existingProfile &&
        existingProfile.profile_picture_url &&
        existingProfile.profile_picture_url.trim() !== "" &&
        existingProfile.profile_picture_url !== profile_picture_url
      ) {
        const oldUrl = existingProfile.profile_picture_url;
        const filename = path.basename(oldUrl);
        const filePath = path.join(__dirname, "../../uploads", filename);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error al borrar imagen anterior:", err);
          } else {
            console.log("Imagen anterior borrada con éxito:", filename);
          }
        });
      }

      // 3) updateOrCreate => actualiza o inserta en la tabla "profiles"
      const updated = await Profile.updateOrCreate(userId, {
        name,
        bio,
        profile_picture_url,
      });

      // Log para depurar
      console.log("[updateProfile] PERFIL ACTUALIZADO:", updated);

      return res.json(updated);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      return res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  },
};

module.exports = profileController;
