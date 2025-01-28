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
import { Dropdown, Button, Alert } from 'react-bootstrap';
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
 * Notas:
 * - El backend guarda "status" en la columna "state". Al traer la tarea, vendrá "state" con "Pending"/"Archived"/etc.
 *   Para simplificar, asumimos que en "task" llega "task.state" en lugar de "task.status".
 *   Pero si tu fetch te trae "status" directamente, ajusta la nomenclatura. 
 */
function TaskItem({
  task,          // { state, priority, difficulty, ... }
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
  const [timeWorked, setTimeWorked] = useState(task.actual_time || 0);

  const playCompleteSound = useSound(completeSound);
  const playDeleteSound = useSound(deleteSound);
  const playEditSound = useSound(editSound);
  const playArchiveSound = useSound(archiveSound);

  // Si no hay ID, no renderizamos
  if (!task || typeof task.id === 'undefined') {
    console.error('TaskItem: "task.id" undefined:', task);
    return null;
  }

  // OJO: en la BD "state" = front "status"
  const status = task.state || 'Pending'; // Valor real del estado
  const difficulty = parseInt(task.difficulty || '1', 10); // "1","2","3"
  const priority = task.priority || 'Low';

  const user = authService.getCurrentUser();
  const token = user?.token;

  // Helpers: mostrar label en español
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

  // Se llama tras guardar en el modal
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
        if (onEdit) onEdit(updatedTask);
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

  // Confirmar borrado
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

  // Completar => PUT /complete
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

  // Archivar => PUT /archive
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

  // Desarchivar => PUT /unarchive
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

  // Cambiar STATUS desde dropdown => PUT /api/tasks/:id con { status: newStatus }
  const handleStatusChange = async (newStatus) => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit && onEdit(updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setActionError('Error al actualizar estado');
    }
  };

  // Cambiar DIFICULTAD => { difficulty: newDiff } (1,2,3)
  const handleDifficultyChange = async (newDiff) => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ difficulty: newDiff }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit && onEdit(updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al actualizar dificultad');
      }
    } catch (error) {
      console.error('Error al actualizar dificultad:', error);
      setActionError('Error al actualizar dificultad');
    }
  };

  // Cambiar PRIORIDAD => { priority: "Low"/"High"/...}
  const handlePriorityChange = async (newPriority) => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit && onEdit(updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al actualizar prioridad');
      }
    } catch (error) {
      console.error('Error al actualizar prioridad:', error);
      setActionError('Error al actualizar prioridad');
    }
  };

  // Temporizador
  const handleStartTimer = () => {
    setTimerActive(true);
  };
  const handleStopTimer = async (time) => {
    setTimerActive(false);
    setTimeWorked((prevTime) => prevTime + time);
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/add-time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Por ejemplo, { duration: 1.5 } en horas
        body: JSON.stringify({ duration: time }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit && onEdit(updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al agregar tiempo trabajado');
      }
    } catch (error) {
      console.error('Error al agregar tiempo trabajado:', error);
      setActionError('Error al agregar tiempo trabajado');
    }
  };

  return (
    <>
      <div
        className={`task-item ${
          status === 'Completed' ? 'completed' : ''
        } ${status === 'Archived' ? 'archived' : ''}`}
      >
        {/* Botón de menú (3 puntos) */}
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

        <h3>{task.title}</h3>
        <p>{task.description}</p>

        {/* 3 dropdowns: Status, Difficulty, Priority */}
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
                  onClick={() => handleStatusChange('Pending')}
                  className="status-pending"
                >
                  Pendiente
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleStatusChange('In Progress')}
                  className="status-in-progress"
                >
                  En Progreso
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleStatusChange('Completed')}
                  className="status-completed"
                >
                  Completado
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* DIFICULTAD */}
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
                  onClick={() => handleDifficultyChange(1)}
                  className="difficulty-1"
                >
                  1 - Fácil
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleDifficultyChange(2)}
                  className="difficulty-2"
                >
                  2 - Medio
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleDifficultyChange(3)}
                  className="difficulty-3"
                >
                  3 - Difícil
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* PRIORIDAD */}
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
                <Dropdown.Item onClick={() => handlePriorityChange('Low')}>
                  Baja
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handlePriorityChange('Medium')}>
                  Media
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handlePriorityChange('High')}>
                  Alta
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}

        <p>Fecha de Creación: {new Date(task.created_at).toLocaleString()}</p>
        {task.estimated_time && (
          <p>Tiempo Estimado: {task.estimated_time} horas</p>
        )}
        {task.actual_time && <p>Tiempo Real: {timeWorked.toFixed(2)} horas</p>}

        {/* Botón "Completar" si no está completada ni archivada */}
        {status !== 'Archived' && status !== 'Completed' && (
          <Button
            variant="success"
            className="complete-button"
            onClick={handleComplete}
          >
            <FaCheck /> Completar
          </Button>
        )}

        {/* Botón "Desarchivar" si está archivada */}
        {status === 'Archived' && (
          <Button
            variant="info"
            className="unarchive-button"
            onClick={handleUnarchive}
          >
            <FaUndo /> Desarchivar
          </Button>
        )}

        {/* Temporizador */}
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

        {actionError && <Alert variant="danger">{actionError}</Alert>}

        {timerActive && <Timer onStop={handleStopTimer} />}
      </div>

      {/* Modal de edición */}
      <EditTaskModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        task={{
          ...task,
          // Pasamos status = state, difficulty=int, priority=string...
          status,
          difficulty,
          priority,
        }}
        handleSave={handleEditSave}
      />

      {/* Modal de confirmación de borrado */}
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

/** Colores de status, difficulty, priority (igual a TaskForm). */
export const getStatusColor = (st) => {
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

export const getDifficultyColor = (diff) => {
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

export const getPriorityColor = (prio) => {
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

export default TaskItem;
