// backend/src/models/Friend.js
const pool = require("../config/db");

const Friend = {
  async sendRequest(fromUserId, toUserId) {
    const existsQuery = `
      SELECT 1
      FROM friendship
      WHERE 
        (user_id = $1 AND friend_id = $2)
        OR (user_id = $2 AND friend_id = $1)
    `;
    const exists = await pool.query(existsQuery, [fromUserId, toUserId]);
    if (exists.rows.length > 0) {
      return null;
    }

    const insertQuery = `
      INSERT INTO friendship (user_id, friend_id, status, created_at)
      VALUES ($1, $2, 'pending', NOW())
      RETURNING *
    `;
    const values = [fromUserId, toUserId];
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  },

  async acceptRequest(friendReqId, currentUserId) {
    const updateQuery = `
      UPDATE friendship
        SET status = 'accepted'
      WHERE id = $1
        AND friend_id = $2
      RETURNING *
    `;
    const values = [friendReqId, currentUserId];
    const result = await pool.query(updateQuery, values);
    return result.rows[0];
  },

  async rejectRequest(friendReqId, currentUserId) {
    const updateQuery = `
      UPDATE friendship
        SET status = 'rejected'
      WHERE id = $1
        AND friend_id = $2
      RETURNING *
    `;
    const values = [friendReqId, currentUserId];
    const result = await pool.query(updateQuery, values);
    return result.rows[0];
  },

  async getFriendsOfUser(userId) {
    const query = `
      SELECT 
        f.*,
        uf.name AS from_name,
        uf.email AS from_email,
        pf.profile_picture_url AS from_photo,
        ut.name AS to_name,
        ut.email AS to_email,
        pt.profile_picture_url AS to_photo
      FROM friendship f
        JOIN users uf ON f.user_id = uf.id
        LEFT JOIN profiles pf ON pf.user_id = uf.id
        JOIN users ut ON f.friend_id = ut.id
        LEFT JOIN profiles pt ON pt.user_id = ut.id
      WHERE 
        (f.user_id = $1 OR f.friend_id = $1)
        AND f.status = 'accepted'
      ORDER BY f.id DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async getRequestsForUser(userId) {
    const query = `
      SELECT 
        f.*,
        uf.name AS from_name,
        uf.email AS from_email,
        pf.profile_picture_url AS from_photo
      FROM friendship f
        JOIN users uf ON f.user_id = uf.id
        LEFT JOIN profiles pf ON pf.user_id = uf.id
      WHERE 
        f.friend_id = $1
        AND f.status = 'pending'
      ORDER BY f.id DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  async findUserByEmailOrId(queryText) {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        p.profile_picture_url
      FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
      WHERE 
        u.email ILIKE $1
        OR CAST(u.id AS TEXT) = $2
    `;
    const values = [`%${queryText}%`, queryText];
    const { rows } = await pool.query(sql, values);
    return rows;
  },
};

module.exports = Friend;
