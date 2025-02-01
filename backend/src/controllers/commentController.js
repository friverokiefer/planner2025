// backend/src/controllers/commentsController.js
const pool = require("../config/db");

const commentsController = {
  addCommentToTask: async (req, res) => {
    try {
      const userId = req.user.id;
      const { taskId } = req.params;
      const { comment } = req.body;

      if (!comment || !comment.trim()) {
        return res
          .status(400)
          .json({ error: "El comentario no puede estar vacío" });
      }

      // Verificar que la tarea exista y sea del usuario o colaborador, o admin
      // Aquí, simplificamos: sólo que la tarea exista
      const taskCheck = await pool.query("SELECT id FROM task WHERE id=$1", [
        taskId,
      ]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ error: "La tarea no existe" });
      }

      // Insertar en comment_legacy
      const insertQuery = `
        INSERT INTO comment_legacy (task_id, user_id, comment, created_at)
        VALUES ($1, $2, $3, now())
        RETURNING *
      `;
      const { rows } = await pool.query(insertQuery, [taskId, userId, comment]);
      return res.json(rows[0]);
    } catch (error) {
      console.error("Error al añadir comentario:", error);
      res.status(500).json({ error: "Error al añadir comentario" });
    }
  },
};

module.exports = commentsController;
