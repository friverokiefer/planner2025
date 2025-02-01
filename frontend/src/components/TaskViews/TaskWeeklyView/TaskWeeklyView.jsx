import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TaskItem from '../../TaskItem/TaskItem';
import { getTasksByPeriod } from '../../../services/taskService';
import './TaskWeeklyView.css';

const TaskWeeklyView = ({ onComplete, onDelete, onEdit, onArchive, onUnarchive }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calcula la fecha de inicio (lunes) y final (domingo) de la semana actual.
  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const adjustedDay = day === 0 ? 7 : day; // Considera domingo como 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - adjustedDay + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  };

  const { startDate, endDate } = getWeekDates();

  const fetchWeeklyTasks = async () => {
    try {
      const response = await getTasksByPeriod({ startDate, endDate });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyTasks();
  }, [startDate, endDate]);

  if (loading) {
    return <div className="weekly-view-loading">Cargando tareas de la semana...</div>;
  }

  return (
    <div className="task-weekly-view">
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
        <div className="no-tasks">No hay tareas para esta semana.</div>
      )}
    </div>
  );
};

TaskWeeklyView.propTypes = {
  onComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onArchive: PropTypes.func,
  onUnarchive: PropTypes.func,
};

TaskWeeklyView.defaultProps = {
  onComplete: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onArchive: () => {},
  onUnarchive: () => {},
};

export default TaskWeeklyView;
