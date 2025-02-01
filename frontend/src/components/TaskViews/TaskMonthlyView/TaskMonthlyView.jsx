// frontend/src/components/TaskViews/TaskMonthlyView/TaskMonthlyView.jsx
import {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import TaskItem from '../../TaskItem/TaskItem';
import { getTasksByPeriod } from '../../../services/taskService';
import './TaskMonthlyView.css';

const TaskMonthlyView = ({ onComplete, onDelete, onEdit, onArchive, onUnarchive }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calcular inicio y fin del mes actual
  const getMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate } = getMonthDates();

  const fetchMonthlyTasks = async () => {
    try {
      const response = await getTasksByPeriod({ startDate, endDate });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching monthly tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyTasks();
  }, [startDate, endDate]);

  if (loading) {
    return <div className="monthly-view-loading">Cargando tareas del mes...</div>;
  }

  return (
    <div className="task-monthly-view">
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
        <div className="no-tasks">No hay tareas para este mes.</div>
      )}
    </div>
  );
};

TaskMonthlyView.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUnarchive: PropTypes.func.isRequired,
};

export default TaskMonthlyView;
