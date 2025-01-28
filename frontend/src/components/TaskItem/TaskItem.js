// frontend/src/components/TaskItem/TaskItem.js

import React, { useState } from 'react';
import './TaskItem.css';
import {
  FaTrashAlt,
  FaCheck,
  FaEdit,
  FaArchive,
  FaUndo,
  FaEllipsisV,
  FaPlay,
  FaStop,
} from 'react-icons/fa';
import { Dropdown, Button, Alert, ProgressBar } from 'react-bootstrap';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import Timer from '../Timer/Timer';
import useSound from '../../hooks/useSound';

// Sonidos
import completeSound from '../../assets/sounds/notification-1-269296.mp3';
import deleteSound from '../../assets/sounds/notification-2-269292.mp3';
import editSound from '../../assets/sounds/notification-sound-3-262896.mp3';
import archiveSound from '../../assets/sounds/intro-sound-2-269294.mp3';

import authService from '../../services/authService';

/**
 * Notas importantes:
 * - El backend guarda "state" para el estado de la tarea, en tu front lo llamas "status".
 * - "estimated_time" y "actual_time" se manejan como horas numéricas (o strings parseables).
 * - Para que la edición funcione (PUT /api/tasks/:id),
 *   tu backend debe permitir actualizar los campos que mandas (priority, difficulty, state, etc.).
 * - El mini gráfico de barra (ProgressBar) usará estimated_time y actual_time para calcular porcentaje.
 */

function TaskItem({
  task,          // objeto con { id, title, description, state, priority, difficulty, estimated_time, actual_time, ...}
  onComplete,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [timerActive, setTimerActive] = useState(false);

  // Si la tarea trae actual_time (num) lo asignamos, si no, 0
  const [timeWorked, setTimeWorked] = useState(parseFloat(task.actual_time) || 0);

  // Sonidos
  const playCompleteSound = useSound(completeSound);
  const playDeleteSound = useSound(deleteSound);
  const playEditSound = useSound(editSound);
  const playArchiveSound = useSound(archiveSound);

  // Si no hay ID, no renderizamos
  if (!task || typeof task.id === 'undefined') {
    console.error('TaskItem: "task.id" undefined:', task);
    return null;
  }

  // "state" => status en el front
  const status = task.state || 'Pending';
  const difficulty = parseInt(task.difficulty || '1', 10); // "1","2","3"
  const priority = task.priority || 'Low';
  const user = authService.getCurrentUser();
  const token = user?.token;

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 1) Helpers de Etiquetas
  // ~~~~~~~~~~~~~~~~~~~~~~
  const getStatusLabel = (st) => {
    switch (st) {
      case 'Pending':
        return 'Pendiente';
      case 'In Progress':
        return 'En Progreso';
      case 'Completed':
        return 'Completado';
      case 'Archived':
        return 'Archivada';
      default:
        return st || 'Pendiente';
    }
  };
  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 1:
        return 'Fácil';
      case 2:
        return 'Medio';
      case 3:
        return 'Difícil';
      default:
        return String(diff);
    }
  };
  const getPriorityLabel = (p) => {
    switch ((p || '').toLowerCase()) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      default:
        return p || 'Baja';
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 2) Helpers de Colores (están en tu code original)
  // ~~~~~~~~~~~~~~~~~~~~~~
  const getStatusColor = (st) => {
    switch (st) {
      case 'Pending':
        return '#007bff'; // Azul
      case 'In Progress':
        return '#ffc107'; // Amarillo
      case 'Completed':
        return '#28a745'; // Verde
      case 'Archived':
        return '#6c757d'; // Gris
      default:
        return '#17a2b8';
    }
  };
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 1:
        return '#28a745'; // Verde
      case 2:
        return '#ffc107'; // Amarillo
      case 3:
        return '#dc3545'; // Rojo
      default:
        return '#6c757d';
    }
  };
  const getPriorityColor = (prio) => {
    switch ((prio || '').toLowerCase()) {
      case 'low':
        return '#007bff'; // Azul
      case 'medium':
        return '#ffc107'; // Amarillo
      case 'high':
        return '#dc3545'; // Rojo
      default:
        return '#6c757d';
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 3) Manejo de Edición (PUT /:id)
  // ~~~~~~~~~~~~~~~~~~~~~~
  const handleEditSave = async (updatedTaskData) => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTaskData),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit && onEdit(updatedTask);
        playEditSound();
        setShowEditModal(false);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al editar la tarea');
      }
    } catch (error) {
      console.error('Error al editar la tarea:', error);
      setActionError('Error al editar la tarea');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 4) Manejo de Borrado
  // ~~~~~~~~~~~~~~~~~~~~~~
  const handleDelete = () => setShowDeleteConfirm(true);
  const confirmDelete = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        onDelete && onDelete(task.id);
        playDeleteSound();
        setShowDeleteConfirm(false);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      setActionError('Error al eliminar la tarea');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 5) Manejo de Completar
  // ~~~~~~~~~~~~~~~~~~~~~~
  const handleComplete = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onComplete && onComplete(updatedTask);
        playCompleteSound();
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al completar la tarea');
      }
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      setActionError('Error al completar la tarea');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 6) Manejo de Archivar/Desarchivar
  // ~~~~~~~~~~~~~~~~~~~~~~
  const handleArchive = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/archive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onArchive && onArchive(updatedTask);
        playArchiveSound();
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al archivar la tarea');
      }
    } catch (error) {
      console.error('Error al archivar la tarea:', error);
      setActionError('Error al archivar la tarea');
    }
  };
  const handleUnarchive = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/unarchive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onUnarchive && onUnarchive(updatedTask);
        playArchiveSound();
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al desarchivar la tarea');
      }
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      setActionError('Error al desarchivar la tarea');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 7) Manejo de Timer + Tiempo
  // ~~~~~~~~~~~~~~~~~~~~~~
  const handleStartTimer = () => {
    setTimerActive(true);
  };
  const handleStopTimer = async (timeSpentHrs) => {
    setTimerActive(false);
    setActionError('');

    // Actualiza la variable local
    setTimeWorked((prev) => prev + timeSpentHrs);

    // Llamamos a /api/tasks/:id/add-time con { duration }
    try {
      // Pedimos un comentario en un prompt, si deseas
      const userComment = window.prompt('Agrega un comentario (opcional):', '') || '';
      const response = await fetch(`/api/tasks/${task.id}/add-time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration: timeSpentHrs, comment: userComment }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        // Notificamos al padre => forzar refresco
        if (onEdit) {
          onEdit({
            ...task,
            actual_time: (parseFloat(task.actual_time) || 0) + timeSpentHrs
          });
        }
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al agregar tiempo trabajado');
      }
    } catch (error) {
      console.error('Error al agregar tiempo trabajado:', error);
      setActionError('Error al agregar tiempo trabajado');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~~
  // 8) Cálculo para la barra de porcentaje
  // ~~~~~~~~~~~~~~~~~~~~~~
  // assumed "task.estimated_time" y "task.actual_time" sean horas numéricas
  const estimatedHours = parseFloat(task.estimated_time) || 0;
  // timeWorked local es la sumatoria local, preferentemente
  const actualHours = timeWorked;
  const usedPercent = estimatedHours > 0 ? Math.min((actualHours / estimatedHours) * 100, 100) : 0;

  // Render principal
  return (
    <>
      <div
        className={`task-item ${
          status === 'Completed' ? 'completed' : ''
        } ${status === 'Archived' ? 'archived' : ''}`}
      >
        {/* -- Menú Superior (3 puntos) -- */}
        <div className="dropdown-top-right">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id={`dropdown-${task.id}`}>
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {status !== 'Archived' && (
                <>
                  <Dropdown.Item onClick={() => setShowEditModal(true)}>
                    <FaEdit /> Editar
                  </Dropdown.Item>

                  {status !== 'Completed' && (
                    <Dropdown.Item
                      onClick={handleComplete}
                      className="complete-dropdown-item"
                    >
                      <FaCheck /> Completar
                    </Dropdown.Item>
                  )}
                  {status === 'Completed' && (
                    <Dropdown.Item
                      onClick={handleUnarchive}
                      className="continue-dropdown-item"
                    >
                      <FaUndo /> Continuar
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    onClick={handleArchive}
                    className="archive-dropdown-item"
                  >
                    <FaArchive /> Archivar
                  </Dropdown.Item>
                </>
              )}
              {status === 'Archived' && (
                <Dropdown.Item
                  onClick={handleUnarchive}
                  className="unarchive-dropdown-item"
                >
                  <FaUndo /> Desarchivar
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={handleDelete}
                className="delete-dropdown-item"
              >
                <FaTrashAlt /> Eliminar
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* -- Info Principal -- */}
        <h3>{task.title}</h3>
        <p>{task.description}</p>

        {/* -- Dropdowns Inline (opcional) => Status, Difficulty, Priority -- */}
        {status !== 'Archived' && (
          <div className="status-difficulty">
            {/* STATUS */}
            <Dropdown className="status-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="status-toggle"
                style={{
                  backgroundColor: getStatusColor(status),
                  color: '#fff',
                }}
              >
                {getStatusLabel(status)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleEditSave({ state: 'Pending' })}
                  className="status-pending"
                >
                  Pendiente
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ state: 'In Progress' })}
                  className="status-in-progress"
                >
                  En Progreso
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ state: 'Completed' })}
                  className="status-completed"
                >
                  Completado
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* DIFICULTY */}
            <Dropdown className="difficulty-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="difficulty-toggle"
                style={{
                  backgroundColor: getDifficultyColor(difficulty),
                  color: '#fff',
                }}
              >
                {getDifficultyLabel(difficulty)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleEditSave({ difficulty: '1' })}
                  className="difficulty-1"
                >
                  1 - Fácil
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ difficulty: '2' })}
                  className="difficulty-2"
                >
                  2 - Medio
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ difficulty: '3' })}
                  className="difficulty-3"
                >
                  3 - Difícil
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* PRIORITY */}
            <Dropdown className="priority-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="priority-toggle"
                style={{
                  backgroundColor: getPriorityColor(priority),
                  color: '#fff',
                }}
              >
                {getPriorityLabel(priority)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleEditSave({ priority: 'Low' })}
                >
                  Baja
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ priority: 'Medium' })}
                >
                  Media
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleEditSave({ priority: 'High' })}
                >
                  Alta
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        {/* -- Fechas y Tiempos -- */}
        <p>Fecha de Creación: {new Date(task.created_at).toLocaleString()}</p>
        {estimatedHours > 0 && (
          <p>Tiempo Estimado: {estimatedHours.toFixed(2)} horas</p>
        )}
        <p>Tiempo Real: {actualHours.toFixed(2)} horas</p>

        {/* -- Mini Barra de Progreso -- */}
        {estimatedHours > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <ProgressBar
              now={usedPercent}
              label={`${usedPercent.toFixed(1)}%`}
              striped
              animated
              style={{ height: '20px' }}
            />
          </div>
        )}

        {/* -- Botón "Completar" si no está completada ni archivada -- */}
        {status !== 'Archived' && status !== 'Completed' && (
          <Button
            variant="success"
            className="complete-button"
            onClick={handleComplete}
          >
            <FaCheck /> Completar
          </Button>
        )}
        {/* -- Botón "Desarchivar" si está archivada -- */}
        {status === 'Archived' && (
          <Button
            variant="info"
            className="unarchive-button"
            onClick={handleUnarchive}
          >
            <FaUndo /> Desarchivar
          </Button>
        )}

        {/* -- Temporizador -- */}
        {status !== 'Archived' && (
          <div className="timer-button">
            {timerActive ? (
              <Button variant="warning" onClick={() => setTimerActive(false)}>
                <FaStop /> Detener Temporizador
              </Button>
            ) : (
              <Button variant="primary" onClick={handleStartTimer}>
                <FaPlay /> Iniciar Temporizador
              </Button>
            )}
          </div>
        )}

        {/* -- Errores de Acción -- */}
        {actionError && <Alert variant="danger">{actionError}</Alert>}

        {/* -- Temporizador Visible -- */}
        {timerActive && <Timer onStop={handleStopTimer} />}
      </div>

      {/* -- Modal de edición manual (campos) -- */}
      <EditTaskModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        task={{
          ...task,
          status,
          difficulty,
          priority,
        }}
        handleSave={handleEditSave}
      />

      {/* -- Modal de confirmación de borrado -- */}
      <ConfirmModal
        show={showDeleteConfirm}
        handleClose={() => setShowDeleteConfirm(false)}
        handleConfirm={confirmDelete}
        title="Confirmar Eliminación"
        body="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
      />
    </>
  );
}

export default TaskItem;
