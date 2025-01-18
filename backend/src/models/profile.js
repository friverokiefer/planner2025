// backend/src/models/profile.js
const pool = require('../config/db');

const Profile = {
  getProfile: async () => {
    const { rows } = await pool.query('SELECT * FROM profiles LIMIT 1');
    return rows.length > 0 ? rows[0] : null;
  },

  updateProfile: async (profile) => {
    const { name, email, bio, profile_picture_url } = profile;
    const { rows } = await pool.query(
      `UPDATE profiles SET name = $1, email = $2, bio = $3, profile_picture_url = $4, updated_at = NOW()
       WHERE id = (SELECT id FROM profiles LIMIT 1) RETURNING *`,
      [name, email, bio, profile_picture_url]
    );
    return rows[0];
  },
};

module.exports = Profile;