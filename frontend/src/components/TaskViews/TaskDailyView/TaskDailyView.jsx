// frontend/src/components/TaskViews/TaskDailyView/TaskDailyView.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TaskItem from '../../TaskItem/TaskItem';
import { getTasksByPeriod } from '../../../services/taskService';
import './TaskDailyView.css';

const TaskDailyView = ({ onComplete, onDelete, onEdit, onArchive, onUnarchive }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const fetchDailyTasks = async () => {
    try {
      const response = await getTasksByPeriod({ startDate: today, endDate: today });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyTasks();
  }, [today]);

  if (loading) {
    return <div className="daily-view-loading">Cargando tareas de hoy...</div>;
  }

  return (
    <div className="task-daily-view">
      {tasks.length > 0 ? (
        tasks.map(task => (
          <TaskItem 
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
          />
        ))
      ) : (
        <div className="no-tasks">No hay tareas para hoy.</div>
      )}
    </div>
  );
};

TaskDailyView.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUnarchive: PropTypes.func.isRequired,
};

export default TaskDailyView;
