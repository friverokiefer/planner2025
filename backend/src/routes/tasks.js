// backend/src/routes/tasks.js
const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");
const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/tasks/filter
 * @desc    Obtener tareas filtradas por rango de fechas
 * @access  Privado
 */
router.get("/filter", tasksController.getTasksByPeriod);

/**
 * @route   GET /api/tasks?filter=owner|collaborator|all
 * @desc    Obtener todas las tareas (filtro optional)
 * @access  Privado
 */
router.get("/", tasksController.getAllTasks);

/**
 * @route   GET /api/tasks/archived
 * @desc    Obtener todas las tareas archivadas
 * @access  Privado
 */
router.get("/archived", tasksController.getArchivedTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Obtener estadísticas de tareas
 * @access  Privado
 */
router.get("/stats", tasksController.getStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Obtener una tarea por su ID
 * @access  Privado
 */
router.get("/:id", tasksController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Crear una nueva tarea
 * @access  Privado
 */
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("El título es obligatorio"),
    // Puedes agregar más validaciones según tus necesidades
  ],
  tasksController.createTask
);

/**
 * @route   PUT /api/tasks/:id/complete
 * @desc    Completar una tarea
 * @access  Privado
 */
router.put("/:id/complete", tasksController.completeTask);

/**
 * @route   PUT /api/tasks/:id/archive
 * @desc    Archivar una tarea
 * @access  Privado
 */
router.put("/:id/archive", tasksController.archiveTask);

/**
 * @route   PUT /api/tasks/:id/unarchive
 * @desc    Desarchivar una tarea
 * @access  Privado
 */
router.put("/:id/unarchive", tasksController.unarchiveTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Actualizar una tarea
 * @access  Privado
 */
router.put("/:id", tasksController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Eliminar una tarea
 * @access  Privado
 */
router.delete("/:id", tasksController.deleteTask);

/**
 * @route   POST /api/tasks/:id/share
 * @desc    Compartir tarea con un colaborador
 * @access  Privado
 */
router.post("/:id/share", tasksController.shareTask);

/**
 * @route   PUT /api/tasks/:id/add-time
 * @desc    Agregar tiempo trabajado a una tarea
 * @access  Privado
 */
router.put("/:id/add-time", tasksController.addTime);

module.exports = router;
