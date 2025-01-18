// frontend/src/components/TaskItem.js
import React, { useState } from 'react';
import './TaskItem.css';
import {
  FaTrashAlt,
  FaCheck,
  FaEdit,
  FaArchive,
  FaUndo,
  FaEllipsisV,
} from 'react-icons/fa';
import { Dropdown, Button, Alert } from 'react-bootstrap';
import EditTaskModal from './EditTaskModal';
import ConfirmModal from './ConfirmModal';
import useSound from '../hooks/useSound';
import completeSound from '../assets/sounds/notification-1-269296.mp3';
import deleteSound from '../assets/sounds/notification-2-269292.mp3';
import editSound from '../assets/sounds/notification-sound-3-262896.mp3';
import archiveSound from '../assets/sounds/intro-sound-2-269294.mp3';

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

  const playCompleteSound = useSound(completeSound);
  const playDeleteSound = useSound(deleteSound);
  const playEditSound = useSound(editSound);
  const playArchiveSound = useSound(archiveSound);

  // Validar que 'task' y 'task.id' existan antes de usarlos
  if (!task || typeof task.id === 'undefined') {
    console.error('El objeto "task" o "task.id" es indefinido:', task);
    return null; // No renderizar nada si 'task' es inválido
  }

  const handleComplete = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'PUT',
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onComplete(updatedTask.id);
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

  const handleContinue = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit(task.id, updatedTask);
        playCompleteSound();
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al continuar la tarea');
      }
    } catch (error) {
      console.error('Error al continuar la tarea:', error);
      setActionError('Error al continuar la tarea');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete(task.id);
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

  const handleEditSave = (updatedTask) => {
    onEdit(task.id, updatedTask);
    playEditSound();
    setShowEditModal(false);
  };

  const handleArchive = async () => {
    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}/archive`, {
        method: 'PUT',
      });
      if (response.ok) {
        onArchive(task.id);
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
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onUnarchive(updatedTask.id);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al desarchivar la tarea');
      }
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      setActionError('Error al desarchivar la tarea');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!newStatus) {
      console.error('Nuevo estado no proporcionado.');
      return;
    }

    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit(task.id, updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al cambiar el estado de la tarea');
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la tarea:', error);
      setActionError('Error al cambiar el estado de la tarea');
    }
  };

  const handleDifficultyChange = async (newDifficulty) => {
    if (!newDifficulty) {
      console.error('Nueva dificultad no proporcionada.');
      return;
    }

    setActionError('');
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty: parseInt(newDifficulty, 10) }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        onEdit(task.id, updatedTask);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al cambiar la dificultad de la tarea');
      }
    } catch (error) {
      console.error('Error al cambiar la dificultad de la tarea:', error);
      setActionError('Error al cambiar la dificultad de la tarea');
    }
  };

  // Función para obtener color basado en estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#007bff'; // Azul
      case 'In Progress':
        return '#ffc107'; // Amarillo
      case 'Completed':
        return '#28a745'; // Verde
      case 'Archived':
        return '#6c757d'; // Gris
      default:
        return '#6c757d';
    }
  };

  // Función para obtener color basado en dificultad
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

  return (
    <>
      <div
        className={`task-item ${
          task.status === 'Completed' ? 'completed' : ''
        } ${task.status === 'Archived' ? 'archived' : ''}`}
      >
        {/* Dropdown en la esquina superior derecha */}
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
                      onClick={handleContinue}
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
                <>
                  <Dropdown.Item
                    onClick={handleUnarchive}
                    className="unarchive-dropdown-item"
                  >
                    <FaUndo /> Desarchivar
                  </Dropdown.Item>
                </>
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

        <h3>{task.name}</h3>
        <p>{task.description}</p>

        {task.status !== 'Archived' && (
          <div className="status-difficulty">
            {/* Dropdown de Estado */}
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

            {/* Dropdown de Dificultad */}
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
          </div>
        )}

        <p>Fecha de Creación: {new Date(task.created_at).toLocaleString()}</p>
        {task.estimated_time && (
          <p>Tiempo Estimado: {task.estimated_time} horas</p>
        )}
        {task.actual_time && <p>Tiempo Real: {task.actual_time} horas</p>}

        {/* Botón Completar en la esquina inferior izquierda */}
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

        {/* Mostrar errores de acciones */}
        {actionError && <Alert variant="danger">{actionError}</Alert>}
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

export default TaskItem;