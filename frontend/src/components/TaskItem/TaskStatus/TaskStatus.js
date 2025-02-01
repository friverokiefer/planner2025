import PropTypes from 'prop-types';
import './TaskStatus.css';

function TaskStatus({ status }) {
  const getColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#6c757d'; // gris
      case 'In Progress':
        return '#007bff'; // azul
      case 'Completed':
        return '#28a745'; // verde
      case 'Archived':
        return '#6c757d'; // gris
      default:
        return '#6c757d';
    }
  };

  return (
    <span
      className="task-status"
      style={{
        backgroundColor: getColor(status),
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '5px',
        fontWeight: 'bold',
      }}
      aria-label={`Estado: ${status}`}
    >
      {status}
    </span>
  );
}

TaskStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

export default TaskStatus;
