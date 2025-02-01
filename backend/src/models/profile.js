// backend/src/models/profile.js

const User = require("./User");
const pool = require("../config/db");

const Profile = {
  getByUserId: async (userId) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM profiles WHERE user_id = $1",
        [userId],
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Profile.getByUserId:", error.message);
      throw error;
    }
  },

  /**
   * updateOrCreate
   * - Si no existe perfil => INSERT
   * - Si existe => UPDATE
   * Nota: name, bio, profile_picture_url
   */
  updateOrCreate: async (userId, { name, bio, profile_picture_url }) => {
    try {
      // Verificar si ya existe un perfil para el usuario
      const existing = await Profile.getByUserId(userId);

      // Obtener información base desde "users"
      const userData = await User.findById(userId);
      if (!userData) {
        throw new Error("Usuario no encontrado");
      }
      const userEmail = userData.email;
      const userNameFromUsers = userData.name;

      // Permitir que 'name' se sobreescriba con lo que viene del frontend
      const finalName = name || userNameFromUsers;

      if (!existing) {
        // Insertar nuevo perfil
        const insertQuery = `
          INSERT INTO profiles (user_id, name, email, bio, profile_picture_url)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const values = [
          userId,
          finalName,
          userEmail,
          bio || "",
          profile_picture_url || "",
        ];
        const { rows } = await pool.query(insertQuery, values);
        return rows[0];
      } else {
        // Actualizar perfil existente
        const updateQuery = `
          UPDATE profiles
          SET
            name = $1,
            bio = $2,
            profile_picture_url = $3,
            updated_at = now()
          WHERE user_id = $4
          RETURNING *
        `;
        const values = [
          finalName,
          bio || "",
          profile_picture_url || "",
          userId,
        ];
        const { rows } = await pool.query(updateQuery, values);
        return rows[0];
      }
    } catch (error) {
      console.error("Profile.updateOrCreate:", error.message);
      throw error;
    }
  },
};

module.exports = Profile;
