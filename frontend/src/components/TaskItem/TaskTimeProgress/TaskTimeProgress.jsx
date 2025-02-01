import PropTypes from 'prop-types';
import './TaskTimeProgress.css';

const TaskTimeProgress = ({ estimated, worked }) => {
  const percentage = estimated > 0 ? Math.min((worked / estimated) * 100, 100) : 0;
  return (
    <div className="task-time-progress">
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
      <div className="progress-text">
        {worked.toFixed(2)}h / {estimated.toFixed(2)}h
      </div>
    </div>
  );
};

TaskTimeProgress.propTypes = {
  estimated: PropTypes.number.isRequired,
  worked: PropTypes.number.isRequired,
};

export default TaskTimeProgress;
