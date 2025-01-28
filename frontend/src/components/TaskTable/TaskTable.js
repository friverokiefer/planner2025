// frontend/src/components/TaskTable/TaskTable.js
import React, { useState } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import authService from '../../services/authService';

function TaskTable({ tasks, onUpdateTask, onDeleteTask }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [localData, setLocalData] = useState({});

  const user = authService.getCurrentUser();

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setLocalData({
      title: task.title,
      priority: task.priority,
      difficulty: task.difficulty,
      state: task.state
    });
  };

  const handleCancel = () => {
    setEditingTaskId(null);
    setLocalData({});
  };

  const handleChange = (e) => {
    setLocalData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (task) => {
    const token = user?.token;
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(localData)
      });
      if (response.ok) {
        const updated = await response.json();
        onUpdateTask(updated);
        setEditingTaskId(null);
        setLocalData({});
      } else {
        console.error('Error al actualizar tarea');
      }
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Título</th>
          <th>Prioridad</th>
          <th>Dificultad</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => {
          const isEditing = editingTaskId === task.id;
          return (
            <tr key={task.id}>
              <td>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="title"
                    value={localData.title}
                    onChange={handleChange}
                  />
                ) : (
                  task.title
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Select
                    name="priority"
                    value={localData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Baja</option>
                    <option value="Medium">Media</option>
                    <option value="High">Alta</option>
                  </Form.Select>
                ) : (
                  task.priority
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Select
                    name="difficulty"
                    value={localData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="1">Fácil</option>
                    <option value="2">Medio</option>
                    <option value="3">Difícil</option>
                  </Form.Select>
                ) : (
                  task.difficulty
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Select
                    name="state"
                    value={localData.state}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pendiente</option>
                    <option value="In Progress">En Progreso</option>
                    <option value="Completed">Completado</option>
                    <option value="Archived">Archivada</option>
                  </Form.Select>
                ) : (
                  task.state
                )}
              </td>
              <td>
                {isEditing ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSave(task)}
                    >
                      Guardar
                    </Button>{' '}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleEditClick(task)}
                    >
                      Editar
                    </Button>{' '}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default TaskTable;