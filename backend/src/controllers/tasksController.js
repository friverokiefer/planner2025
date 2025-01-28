// backend/src/controllers/tasksController.js

const Task = require('../models/task');
const { validationResult } = require('express-validator');

/**
 * EJEMPLO DE FUNCIÓN AUXILIAR (opcional)
 * para parsear el query param filter=owner|collaborator|all
 */
function getFilterParam(req) {
  // Si no viene ?filter=..., por defecto = 'all'
  const validFilters = ['owner', 'collaborator', 'all'];
  const filter = (req.query.filter || 'all').toLowerCase();
  return validFilters.includes(filter) ? filter : 'all';
}

const tasksController = {
  /**
   * Obtener tareas (NO archivadas) con posibilidad de filtrar
   * ?filter=owner|collaborator|all
   */
  getAllTasks: async (req, res) => {
    try {
      // Usamos el query param
      const filter = getFilterParam(req);

      let tasks;
      if (req.user.role === 'admin') {
        // Admin ve todo (ignora filter => puede verse unificado si gustas)
        tasks = await Task.getAll();
      } else {
        if (filter === 'owner') {
          tasks = await Task.getAllByUserId(req.user.id); // Tareas donde user_id = user
        } else if (filter === 'collaborator') {
          // Requiere un método en tu modelo: getAllAsCollaborator
          // Que busque en la tabla task_assignment (o similar) las tareas donde
          // user = req.user.id y role = 'collaborator'
          tasks = await Task.getAllAsCollaborator(req.user.id);
        } else {
          // 'all' => Owner + Colaborador
          // un método getAllByUserOwnerOrCollab, o la union de ambos
          tasks = await Task.getAllOwnerOrCollaborator(req.user.id);
        }
      }
      res.json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ error: 'Error al obtener las tareas' });
    }
  },

  /**
   * Obtener todas las tareas archivadas
   */
  getArchivedTasks: async (req, res) => {
    try {
      let tasks;
      if (req.user.role === 'admin') {
        tasks = await Task.getArchivedTasks();
      } else {
        tasks = await Task.getArchivedTasksByUserId(req.user.id);
      }
      res.json(tasks);
    } catch (error) {
      console.error('Error al obtener tareas archivadas:', error);
      res.status(500).json({ error: 'Error al obtener tareas archivadas' });
    }
  },

  /**
   * Obtener una tarea por su ID
   */
  getTaskById: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }

      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error al obtener la tarea:', error);
      res.status(500).json({ error: 'Error al obtener la tarea' });
    }
  },

  /**
   * Crear una nueva tarea
   */
  createTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Asignar user_id al body para forzar que la tarea sea del usuario logueado
      const taskData = {
        ...req.body,
        user_id: req.user.id,
      };
      const newTask = await Task.create(taskData);
      return res.status(201).json(newTask);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      res.status(500).json({ error: 'Error al crear la tarea' });
    }
  },

  /**
   * Completar una tarea (is_active = false, completed_at = NOW())
   */
  completeTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.complete(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      res.status(500).json({ error: 'Error al completar la tarea' });
    }
  },

  /**
   * Archivar una tarea (archived_at = NOW())
   */
  archiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.archive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al archivar la tarea:', error);
      res.status(500).json({ error: 'Error al archivar la tarea' });
    }
  },

  /**
   * Desarchivar una tarea (archived_at = NULL)
   */
  unarchiveTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      const updatedTask = await Task.unarchive(req.params.id);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      res.status(500).json({ error: 'Error al desarchivar la tarea' });
    }
  },

  /**
   * Actualizar una tarea
   */
  updateTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      const updatedTask = await Task.update(req.params.id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
  },

  /**
   * Eliminar una tarea
   */
  deleteTask: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(req.params.id);
      } else {
        task = await Task.getByIdAndUser(req.params.id, req.user.id);
      }
      if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }

      await Task.delete(req.params.id);
      res.json({ message: 'Tarea eliminada' });
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
  },

  /**
   * Obtener estadísticas de tareas
   * Devuelve un JSON con:
   * {
   *   totalTasks,
   *   completed,
   *   pending,
   *   inProgress,
   *   stackedData: [
   *     { priority: 'Low', difficulty_1: X, difficulty_2: Y, ... },
   *     ...
   *   ]
   * }
   */
  getStats: async (req, res) => {
    try {
      let totalTasks, completed, pending, inProgress;
      // stackedData => agrupar por priority + difficulty
      let stackedData = [];

      if (req.user.role === 'admin') {
        totalTasks = await Task.countAll();
        completed = await Task.countByStatus('Completed');
        pending = await Task.countByStatus('Pending');
        inProgress = await Task.countByStatus('In Progress');
        // Por ejemplo, un método getStackedPriorityDifficultyAll()
        stackedData = await Task.getStackedPriorityDifficultyAll();
      } else {
        totalTasks = await Task.countAllForUser(req.user.id);
        completed = await Task.countByStatusForUser('Completed', req.user.id);
        pending = await Task.countByStatusForUser('Pending', req.user.id);
        inProgress = await Task.countByStatusForUser('In Progress', req.user.id);
        // getStackedPriorityDifficultyByUser
        stackedData = await Task.getStackedPriorityDifficultyByUser(req.user.id);
      }

      return res.json({
        totalTasks,
        completed,
        pending,
        inProgress,
        stackedData,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  /**
   * Compartir una tarea con otro usuario => INSERT en task_assignment (role='collaborator')
   */
  shareTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { collaborator_id } = req.body;

      // 1) Verificar que la tarea sea del user (owner) o que sea admin
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(taskId);
      } else {
        task = await Task.getByIdAndUser(taskId, req.user.id);
      }
      if (!task) {
        return res.status(403).json({ error: 'No tienes permiso para compartir esta tarea' });
      }

      // 2) Llamar a un método del modelo:
      // p.ej. Task.shareTask(taskId, collaborator_id)
      const result = await Task.shareTask(taskId, collaborator_id);
      if (!result) {
        return res.status(400).json({ error: 'No se pudo asignar al colaborador (¿ya existe?)' });
      }
      return res.json({ msg: 'Tarea compartida con éxito', assignment: result });
    } catch (error) {
      console.error('Error al compartir la tarea:', error);
      return res.status(500).json({ error: 'Error al compartir la tarea' });
    }
  },

  /**
   * Agregar tiempo trabajado (en horas) + comentario opcional
   * => Actualiza la sumatoria en la BD (p.ej. en una tabla task_time_summary) y opcionalmente inserta un comment
   */
  addTime: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { duration, comment } = req.body;

      // 1) Verificar que user sea owner o collaborator
      let task;
      if (req.user.role === 'admin') {
        task = await Task.getById(taskId);
      } else {
        // O un método: getByIdAndUserOrCollab(taskId, req.user.id)
        task = await Task.getByIdAndUser(taskId, req.user.id);
        // (Si colaborador => también debería retornar esa tarea)
      }
      if (!task) {
        return res.status(403).json({ error: 'No tienes permiso para añadir tiempo a esta tarea' });
      }

      // 2) Llamar al modelo p.ej. Task.addTime(taskId, req.user.id, duration, comment)
      const result = await Task.addTime(taskId, req.user.id, duration, comment);
      if (!result) {
        return res.status(400).json({ error: 'No se pudo agregar el tiempo' });
      }
      return res.json({ msg: 'Tiempo agregado', data: result });
    } catch (error) {
      console.error('Error al agregar tiempo:', error);
      return res.status(500).json({ error: 'Error al agregar tiempo' });
    }
  },
};

module.exports = tasksController;
