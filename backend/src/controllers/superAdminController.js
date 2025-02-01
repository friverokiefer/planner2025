// backend/src/controllers/superAdminController.js
const pool = require("../config/db");

const superAdminController = {
  async getUsersExtended(req, res) {
    try {
      // Verificar que req.user.role sea 'superadmin'
      if (req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      // Hacer un join o varias subconsultas:
      // "friends_count" => count de rows en friendship donde user es user_id or friend_id con status='accepted'
      // "tasks_pending" => count de tasks por user_id con state='Pending'
      // "tasks_inprogress" => ...
      // "tasks_completed" => ...
      // Ejemplo rápido con subconsultas:

      const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        (SELECT COUNT(*) FROM friendship f
          WHERE (f.user_id = u.id OR f.friend_id = u.id)
          AND f.status = 'accepted') AS friends_count,
        (SELECT COUNT(*) FROM task t
          WHERE t.user_id = u.id AND t.state = 'Pending') AS tasks_pending,
        (SELECT COUNT(*) FROM task t
          WHERE t.user_id = u.id AND t.state = 'In Progress') AS tasks_inprogress,
        (SELECT COUNT(*) FROM task t
          WHERE t.user_id = u.id AND t.state = 'Completed') AS tasks_completed
      FROM users u
      ORDER BY u.id;
      `;

      const { rows } = await pool.query(query);
      return res.json(rows);
    } catch (error) {
      console.error("Error getUsersExtended superadmin:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  },
};

module.exports = superAdminController;
