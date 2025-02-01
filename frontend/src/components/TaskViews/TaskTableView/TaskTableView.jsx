// frontend/src/components/TaskViews/TaskTableView/TaskTableView.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TaskTable from '../../TaskTable/TaskTable';
import { getTasks } from '../../../services/taskService';
import './TaskTableView.css';

const TaskTableView = ({ onUpdateTask, onDeleteTask }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="task-table-loading">Cargando tareas...</div>;
  }

  return (
    <div className="task-table-view">
      <TaskTable
        tasks={tasks}
        onUpdateTask={(updatedTask) =>
          setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
        }
        onDeleteTask={(id) =>
          setTasks(prev => prev.filter(task => task.id !== id))
        }
      />
    </div>
  );
};

TaskTableView.propTypes = {
  onUpdateTask: PropTypes.func,
  onDeleteTask: PropTypes.func,
};

export default TaskTableView;
