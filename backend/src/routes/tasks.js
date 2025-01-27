// backend/src/routes/tasks.js

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/tasks
 * @desc    Obtener todas las tareas (administrador puede ver todas)
 * @access  Privado
 */
router.get('/', tasksController.getAllTasks);

/**
 * @route   GET /api/tasks/archived
 * @desc    Obtener todas las tareas archivadas
 * @access  Privado
 */
router.get('/archived', tasksController.getArchivedTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Obtener una tarea por su ID
 * @access  Privado
 */
router.get('/:id', tasksController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Crear una nueva tarea
 * @access  Privado
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    // Puedes agregar más validaciones según tus necesidades
  ],
  tasksController.createTask
);

/**
 * @route   PUT /api/tasks/:id/complete
 * @desc    Completar una tarea
 * @access  Privado
 */
router.put('/:id/complete', tasksController.completeTask);

/**
 * @route   PUT /api/tasks/:id/archive
 * @desc    Archivar una tarea
 * @access  Privado
 */
router.put('/:id/archive', tasksController.archiveTask);

/**
 * @route   PUT /api/tasks/:id/unarchive
 * @desc    Desarchivar una tarea
 * @access  Privado
 */
router.put('/:id/unarchive', tasksController.unarchiveTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Actualizar una tarea
 * @access  Privado
 */
router.put('/:id', tasksController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Eliminar una tarea
 * @access  Privado
 */
router.delete('/:id', tasksController.deleteTask);

/**
 * @route   GET /api/tasks/stats
 * @desc    Obtener estadísticas de tareas
 * @access  Privado
 */
router.get('/stats', tasksController.getStats);

module.exports = router;
