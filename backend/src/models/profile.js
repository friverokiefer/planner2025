// backend/src/models/profile.js
const User = require('./User');
const pool = require('../config/db');

const Profile = {
  getByUserId: async (userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    return rows[0] || null;
  },

  updateOrCreate: async (userId, { name, bio, profile_picture_url }) => {
    // Buscamos si hay un profile existente
    const existing = await Profile.getByUserId(userId);

    // Tomamos la info base desde "users"
    const userData = await User.findById(userId);
    const userEmail = userData.email;  
    const userNameFromUsers = userData.name; 

    // Permitimos que 'name' se pueda sobreescribir por lo que venga
    const finalName = name || userNameFromUsers;

    if (!existing) {
      // Insertar
      const insertQuery = `
        INSERT INTO profiles (user_id, name, email, bio, profile_picture_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [
        userId,
        finalName,
        userEmail, 
        bio || '',
        profile_picture_url || '',
      ];
      const { rows } = await pool.query(insertQuery, values);
      return rows[0];
    } else {
      // Actualizar
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
        bio || '',
        profile_picture_url || '',
        userId,
      ];
      const { rows } = await pool.query(updateQuery, values);
      return rows[0];
    }
  },
};

module.exports = Profile;
