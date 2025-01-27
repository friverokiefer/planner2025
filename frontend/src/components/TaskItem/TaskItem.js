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

function TaskItem({
  task,
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

  if (!task || typeof task.id === 'undefined') {
    console.error('TaskItem: "task" o "task.id" está indefinido:', task);
    return null;
  }

  const user = authService.getCurrentUser();
  const token = user?.token;

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

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Actualizar STATUS sin abrir modal:
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

  // Actualizar DIFFICULTY
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

  // NUEVO => Actualizar PRIORITY
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
          task.status === 'Completed' ? 'completed' : ''
        } ${task.status === 'Archived' ? 'archived' : ''}`}
      >
        {/* Dropdown menú (3 puntos) */}
        <div className="dropdown-top-right">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id={`dropdown-${task.id}`}>
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {task.status !== 'Archived' && (
                <>
                  <Dropdown.Item onClick={() => setShowEditModal(true)}>
                    <FaEdit /> Editar
                  </Dropdown.Item>
                  {task.status !== 'Completed' && (
                    <Dropdown.Item
                      onClick={handleComplete}
                      className="complete-dropdown-item"
                    >
                      <FaCheck /> Completar
                    </Dropdown.Item>
                  )}
                  {task.status === 'Completed' && (
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

              {task.status === 'Archived' && (
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
        {task.status !== 'Archived' && (
          <div className="status-difficulty">
            {/* Status */}
            <Dropdown className="status-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="status-toggle"
                style={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                }}
              >
                {task.status}
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

            {/* Difficulty */}
            <Dropdown className="difficulty-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="difficulty-toggle"
                style={{
                  backgroundColor: getDifficultyColor(task.difficulty),
                  color: 'white',
                }}
              >
                {task.difficulty === 1
                  ? 'Fácil'
                  : task.difficulty === 2
                  ? 'Medio'
                  : 'Difícil'}
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

            {/* Priority */}
            <Dropdown className="priority-dropdown">
              <Dropdown.Toggle
                variant="light"
                className="priority-toggle"
                style={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                }}
              >
                {task.priority}
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
        {task.actual_time && (
          <p>Tiempo Real: {timeWorked.toFixed(2)} horas</p>
        )}

        {/* Botón "Completar" si no está completada/archivada */}
        {task.status !== 'Archived' && task.status !== 'Completed' && (
          <Button
            variant="success"
            className="complete-button"
            onClick={handleComplete}
            title="Completar Tarea"
          >
            <FaCheck /> Completar
          </Button>
        )}

        {/* Botón "Desarchivar" si está archivada */}
        {task.status === 'Archived' && (
          <Button
            variant="info"
            className="unarchive-button"
            onClick={handleUnarchive}
            title="Desarchivar Tarea"
          >
            <FaUndo /> Desarchivar
          </Button>
        )}

        {/* Temporizador */}
        {task.status !== 'Archived' && (
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

      <EditTaskModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        task={task}
        handleSave={handleEditSave}
      />

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

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return '#ffc107'; // Amarillo
    case 'In Progress':
      return '#17a2b8'; // Azul
    case 'Completed':
      return '#28a745'; // Verde
    case 'Archived':
      return '#6c757d'; // Gris
    default:
      return '#17a2b8';
  }
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 1:
      return '#28a745'; // Verde
    case 2:
      return '#ffc107'; // Amarillo
    case 3:
      return '#dc3545'; // Rojo
    default:
      return '#6c757d'; // Gris
  }
};

const getPriorityColor = (priority) => {
  switch ((priority || '').toLowerCase()) {
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
