// frontend/src/components/TaskRedistribution/TaskRedistribution.jsx

import { useState } from 'react';
import PropTypes from 'prop-types';
import './TaskRedistribution.css';

const TaskRedistribution = ({ tasks, onUpdateTasks }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [newDate, setNewDate] = useState('');

  const handleTaskSelect = task => {
    setSelectedTask(task);
  };

  const handleDateChange = e => {
    setNewDate(e.target.value);
  };

  const handleReassign = () => {
    if (selectedTask && newDate) {
      const updatedTask = { ...selectedTask, end_date: newDate };
      onUpdateTasks(updatedTask);
      setSelectedTask(null);
      setNewDate('');
    }
  };

  return (
    <div className="task-redistribution">
      <h4>Reprogramar Tareas</h4>
      <div className="redistribution-list">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`redistribution-item ${
              selectedTask && selectedTask.id === task.id ? 'selected' : ''
            }`}
            onClick={() => handleTaskSelect(task)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTaskSelect(task);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {task.title} - {task.time_estimated}h
          </div>
        ))}
      </div>
      {selectedTask && (
        <div className="redistribution-form">
          <label htmlFor="new-end-date">
            Seleccionar Nueva Fecha de Finalización:
          </label>
          <input
            type="date"
            id="new-end-date"
            value={newDate}
            onChange={handleDateChange}
          />
          <button type="button" onClick={handleReassign}>
            Reasignar
          </button>
        </div>
      )}
    </div>
  );
};

TaskRedistribution.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      time_estimated: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      end_date: PropTypes.string,
    })
  ).isRequired,
  onUpdateTasks: PropTypes.func.isRequired,
};

export default TaskRedistribution;
