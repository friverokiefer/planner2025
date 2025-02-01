// frontend/src/components/TaskTable/TaskTable.js
import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

function TaskTable({ tasks, onUpdateTask, onDeleteTask }) {
  const [sortedTasks, setSortedTasks] = useState([...tasks]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    setSortedTasks([...tasks]);
  }, [tasks]);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sorted = [...sortedTasks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedTasks(sorted);
  };

  const handleEditClick = task => {
    setEditingTaskId(task.id);
    setLocalData({
      title: task.title,
      priority: task.priority,
      difficulty: task.difficulty,
      state: task.state,
    });
  };

  const handleCancel = () => {
    setEditingTaskId(null);
    setLocalData({});
  };

  const handleChange = e => {
    setLocalData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async task => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localData),
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
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th onClick={() => requestSort('title')}>Título</th>
          <th onClick={() => requestSort('priority')}>Prioridad</th>
          <th onClick={() => requestSort('difficulty')}>Dificultad</th>
          <th onClick={() => requestSort('state')}>Estado</th>
          <th onClick={() => requestSort('estimated_time')}>Tiempo Estimado (h)</th>
          <th onClick={() => requestSort('total_time_spent_hours')}>Tiempo Trabajado (h)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {sortedTasks.map(task => {
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
              <td>{task.estimated_time} </td>
              <td>{task.total_time_spent_hours.toFixed(2)} </td>
              <td>
                {isEditing ? (
                  <>
                    <Button variant="success" size="sm" onClick={() => handleSave(task)}>
                      Guardar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="info" size="sm" onClick={() => handleEditClick(task)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDeleteTask(task.id)}>
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

TaskTable.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      priority: PropTypes.string,
      difficulty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      state: PropTypes.string,
      estimated_time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      total_time_spent_hours: PropTypes.number,
    })
  ).isRequired,
  onUpdateTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
};

export default TaskTable;
