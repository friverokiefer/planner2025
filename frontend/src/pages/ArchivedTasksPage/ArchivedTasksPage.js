// frontend/src/pages/ArchivedTasksPage/ArchivedTasksPage.js

import React, { useState, useEffect } from 'react';
import TaskItem from '../../components/TaskItem/TaskItem'; // Ruta corregida
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'; // Ruta corregida
import './ArchivedTasksPage.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Alert } from 'react-bootstrap';
import authService from '../../services/authService';

function ArchivedTasksPage() {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  
  // Eliminar
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchArchivedTasks = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('No hay usuario autenticado');
        return;
      }
      const response = await fetch('/api/tasks/archived', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) {
        throw new Error('Error al obtener las tareas archivadas');
      }
      const data = await response.json();
      setArchivedTasks(data);
    } catch (err) {
      console.error('Error al obtener tareas archivadas:', err);
      setError('Error al obtener tareas archivadas');
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
    // eslint-disable-next-line
  }, []);

  // Desarchivar
  const handleUnarchive = async (id) => {
    setActionError('');
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`/api/tasks/${id}/unarchive`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        setArchivedTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al desarchivar la tarea');
      }
    } catch (error) {
      console.error('Error al desarchivar la tarea:', error);
      setActionError('Error al desarchivar la tarea');
    }
  };

  // Editar Tarea archivada
  const handleEdit = async (id, updatedTask) => {
    setActionError('');
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(updatedTask),
      });
      if (response.ok) {
        const data = await response.json();
        setArchivedTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al editar la tarea archivada');
      }
    } catch (error) {
      console.error('Error al editar la tarea archivada:', error);
      setActionError('Error al editar la tarea archivada');
    }
  };

  // Eliminar Tarea archivada
  const handleDelete = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setActionError('');
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        setArchivedTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
      } else {
        const errorData = await response.json();
        setActionError(errorData.error || 'Error al eliminar la tarea archivada');
      }
    } catch (error) {
      console.error('Error al eliminar la tarea archivada:', error);
      setActionError('Error al eliminar la tarea archivada');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Drag & Drop archivadas
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(archivedTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setArchivedTasks(items);
    // Opcional: actualizar orden en backend
  };

  return (
    <div className="archived-tasks-page">
      <h2>Tareas Archivadas</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {actionError && <Alert variant="danger">{actionError}</Alert>}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="archivedTasks">
          {(provided) => (
            <div
              className="task-container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {archivedTasks.length > 0 ? (
                archivedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'dragging' : ''}
                      >
                        <TaskItem
                          task={task}
                          onUnarchive={handleUnarchive}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <p>No hay tareas archivadas.</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {taskToDelete && (
        <ConfirmModal
          show={showDeleteConfirm}
          handleClose={handleDeleteCancel}
          handleConfirm={confirmDelete}
          title="Confirmar Eliminación"
          body="¿Estás seguro de que deseas eliminar esta tarea archivada? Esta acción no se puede deshacer."
        />
      )}
    </div>
  );
}

export default ArchivedTasksPage;
