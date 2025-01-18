const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { body, param } = require('express-validator');

// Obtener tareas archivadas primero para evitar conflictos con /:id
router.get('/archived', tasksController.getArchivedTasks);

// Obtener estadísticas de tareas
router.get('/stats', tasksController.getStats);

// Obtener todas las tareas no archivadas
router.get('/', tasksController.getAllTasks);

// Obtener una tarea por ID con validación
router.get('/:id',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.')
  ],
  tasksController.getTaskById
);

// Crear una nueva tarea con validaciones
router.post('/',
  [
    body('name').isLength({ min: 1 }).withMessage('El nombre de la tarea es obligatorio.'),
    body('description').optional().isString(),
    body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Prioridad inválida.'),
    body('difficulty').isInt({ min: 1, max: 3 }).withMessage('Dificultad debe ser 1, 2 o 3.'),
    body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Estado inválido.'),
    body('estimated_time').optional().isFloat({ min: 0 }).withMessage('Tiempo estimado debe ser un número positivo.'),
    body('actual_time').optional().isFloat({ min: 0 }).withMessage('Tiempo real debe ser un número positivo.')
  ],
  tasksController.createTask
);

// Completar una tarea con validación
router.put('/:id/complete',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.')
  ],
  tasksController.completeTask
);

// Archivar una tarea con validación
router.put('/:id/archive',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.')
  ],
  tasksController.archiveTask
);

// Desarchivar una tarea con validación
router.put('/:id/unarchive',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.')
  ],
  tasksController.unarchiveTask
);

// Actualizar una tarea existente con validaciones
router.put('/:id',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.'),
    body('name').optional().isLength({ min: 1 }).withMessage('El nombre de la tarea no puede estar vacío.'),
    body('description').optional().isString(),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Prioridad inválida.'),
    body('difficulty').optional().isInt({ min: 1, max: 3 }).withMessage('Dificultad debe ser 1, 2 o 3.'),
    body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Archived']).withMessage('Estado inválido.'),
    body('estimated_time').optional().isFloat({ min: 0 }).withMessage('Tiempo estimado debe ser un número positivo.'),
    body('actual_time').optional().isFloat({ min: 0 }).withMessage('Tiempo real debe ser un número positivo.')
  ],
  tasksController.updateTask
);

// Eliminar una tarea con validación
router.delete('/:id',
  [
    param('id').isInt().withMessage('ID de tarea debe ser un número entero.')
  ],
  tasksController.deleteTask
);

module.exports = router;