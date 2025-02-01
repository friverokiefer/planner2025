// backend/src/middleware/loadValidationMiddleware.js
const Task = require("../models/task");
const User = require("../models/User"); // Asegúrate de que este modelo exista

const loadValidationMiddleware = async (req, res, next) => {
  try {
    const { assigned_to, time_estimated, end_date } = req.body;
    const userId = assigned_to;

    // Calcular la capacidad del usuario (puede ser un campo en el modelo User)
    const user = await User.findById(userId);
    const userCapacity = user.capacity || 8; // Ejemplo: 8 horas diarias

    // Obtener todas las tareas asignadas al usuario en el mismo día
    const tasks = await Task.find({
      assigned_to: userId,
      end_date: {
        $gte: new Date(end_date.setHours(0, 0, 0, 0)),
        $lte: new Date(end_date.setHours(23, 59, 59, 999)),
      },
    });

    const totalEstimated =
      tasks.reduce((acc, task) => acc + task.time_estimated, 0) +
      time_estimated;

    if (totalEstimated > userCapacity) {
      return res.status(400).json({
        message: `Sobrecarga de carga horaria. Capacidad diaria: ${userCapacity} horas, Total asignado: ${totalEstimated} horas.`,
      });
    }

    next();
  } catch (error) {
    console.error("Error en loadValidationMiddleware:", error);
    res.status(500).json({ message: "Error al validar la carga horaria" });
  }
};

module.exports = loadValidationMiddleware;
