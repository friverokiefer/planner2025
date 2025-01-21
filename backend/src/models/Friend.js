// backend/src/models/Friend.js
const pool = require('../config/db');

const Friend = {
  /**
   * Enviar solicitud de amistad
   */
  async sendRequest(fromUserId, toUserId) {
    // Ver si ya existe una relación (amistad o solicitud) entre ambos
    const existsQuery = `
      SELECT 1
      FROM friends
      WHERE 
        (from_user_id = $1 AND to_user_id = $2)
        OR (from_user_id = $2 AND to_user_id = $1)
    `;
    const exists = await pool.query(existsQuery, [fromUserId, toUserId]);
    if (exists.rows.length > 0) {
      // Ya existe una solicitud o amistad
      return null;
    }

    // Insertar nueva solicitud en estado 'pending'
    const insertQuery = `
      INSERT INTO friends (from_user_id, to_user_id, status, created_at, updated_at)
      VALUES ($1, $2, 'pending', NOW(), NOW())
      RETURNING *
    `;
    const values = [fromUserId, toUserId];
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  },

  /**
   * Aceptar solicitud de amistad
   */
  async acceptRequest(friendReqId, currentUserId) {
    // Solo el destinatario (to_user_id) puede aceptar
    const updateQuery = `
      UPDATE friends
        SET status = 'accepted',
            updated_at = NOW()
      WHERE id = $1
        AND to_user_id = $2
      RETURNING *
    `;
    const values = [friendReqId, currentUserId];
    const result = await pool.query(updateQuery, values);
    return result.rows[0];
  },

  /**
   * Rechazar solicitud de amistad
   */
  async rejectRequest(friendReqId, currentUserId) {
    // Solo el destinatario (to_user_id) puede rechazar
    const updateQuery = `
      UPDATE friends
        SET status = 'rejected',
            updated_at = NOW()
      WHERE id = $1
        AND to_user_id = $2
      RETURNING *
    `;
    const values = [friendReqId, currentUserId];
    const result = await pool.query(updateQuery, values);
    return result.rows[0];
  },

  /**
   * Obtener todos los amigos (relaciones en status='accepted')
   * para un usuario (userId). Se hace un JOIN para tener info de nombres y fotos.
   */
  async getFriendsOfUser(userId) {
    const query = `
      SELECT 
        f.*,
        -- Datos del usuario "from_user"
        uf.name             AS from_name,
        uf.email            AS from_email,
        pf.profile_picture_url AS from_photo,
        -- Datos del usuario "to_user"
        ut.name             AS to_name,
        ut.email            AS to_email,
        pt.profile_picture_url AS to_photo
      FROM friends f
        JOIN users uf ON f.from_user_id = uf.id
        LEFT JOIN profiles pf ON pf.user_id = uf.id
        JOIN users ut ON f.to_user_id = ut.id
        LEFT JOIN profiles pt ON pt.user_id = ut.id
      WHERE 
        (f.from_user_id = $1 OR f.to_user_id = $1)
        AND f.status = 'accepted'
      ORDER BY f.id DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  /**
   * Lista de solicitudes pendientes para un usuario (userId).
   * Se asume que userId es el "destinatario" (to_user_id).
   * JOIN para obtener nombre y foto de quien envía la solicitud.
   */
  async getRequestsForUser(userId) {
    const query = `
      SELECT 
        f.*,
        uf.name  AS from_name,
        uf.email AS from_email,
        pf.profile_picture_url AS from_photo
      FROM friends f
        JOIN users uf ON f.from_user_id = uf.id
        LEFT JOIN profiles pf ON pf.user_id = uf.id
      WHERE 
        f.to_user_id = $1
        AND f.status = 'pending'
      ORDER BY f.id DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  },

  /**
   * Buscar usuario por email o ID
   * Se hace LEFT JOIN con la tabla profiles para también devolver la foto
   */
  async findUserByEmailOrId(queryText) {
    // El ILIKE sirve para coincidencias parciales en email
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
