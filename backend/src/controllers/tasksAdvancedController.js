// backend/src/controllers/tasksAdvancedController.js

const Task = require("../models/task");

/**
 * Obtener todas las tareas del usuario (propietario o colaborador)
 */
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.getAllOwnerOrCollaborator(userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error en getAllTasks:", error);
    res.status(500).json({ message: "Error al obtener todas las tareas" });
  }
};

/**
 * Obtener tareas filtradas por periodo
 */
exports.getTasksByPeriod = async (req, res) => {
  try {
    const { period, customStartDate, customEndDate } = req.query;
    let startDate, endDate;

    const today = new Date();
    switch (period) {
      case "Hoy":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "Semana Actual":
        const firstDayOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay() + 1),
        );
        startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
        endDate = new Date(
          firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 6),
        );
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Mes Actual":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Año Actual":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Semana Pasada":
        const lastWeek = new Date(today.setDate(today.getDate() - 7));
        const firstDayLastWeek = new Date(
          lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() + 1),
        );
        startDate = new Date(firstDayLastWeek.setHours(0, 0, 0, 0));
        endDate = new Date(
          firstDayLastWeek.setDate(firstDayLastWeek.getDate() + 6),
        );
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Mes Pasado":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Año Pasado":
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Periodo Personalizado":
        if (!customStartDate || !customEndDate) {
          return res
            .status(400)
            .json({ message: "Fechas personalizadas incompletas" });
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        return res.status(400).json({ message: "Periodo inválido" });
    }

    const tasks = await Task.getTasksByDateRange(
      req.user.id,
      startDate,
      endDate,
    );
    res.json(tasks);
  } catch (error) {
    console.error("Error en getTasksByPeriod:", error);
    res.status(500).json({ message: "Error al obtener tareas por periodo" });
  }
};

/**
 * Crear una nueva tarea
 */
exports.createTask = async (req, res) => {
  try {
    const taskData = req.body;
    taskData.user_id = req.user.id; // Asignar el usuario actual como propietario

    const newTask = await Task.create(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error en createTask:", error);
    res.status(500).json({ message: "Error al crear la tarea" });
  }
};

/**
 * Actualizar una tarea
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTask = await Task.update(id, updateData);
    if (!updatedTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error en updateTask:", error);
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
};

/**
 * Eliminar una tarea
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Task.delete(id);
    if (!success) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error en deleteTask:", error);
    res.status(500).json({ message: "Error al eliminar la tarea" });
  }
};
