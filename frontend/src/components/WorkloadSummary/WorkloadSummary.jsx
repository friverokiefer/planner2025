// frontend/src/components/WorkloadSummary/WorkloadSummary.jsx

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './WorkloadSummary.css';

const WorkloadSummary = ({ tasks, capacity, onRedistribute }) => {
  const [totalHours, setTotalHours] = useState(0);
  const [isOverloaded, setIsOverloaded] = useState(false);

  useEffect(() => {
    const sumHours = tasks.reduce(
      (acc, task) => acc + (task.time_estimated || 0),
      0
    );
    setTotalHours(sumHours);
    setIsOverloaded(sumHours > capacity);
  }, [tasks, capacity]);

  return (
    <div className="workload-summary">
      <h4>Resumen de Carga Horaria</h4>
      <p>
        Total Horas Estimadas: {totalHours} / Capacidad: {capacity} horas
      </p>
      {isOverloaded && (
        <div className="overload-alert">
          <p>
            ¡Sobrecarga detectada! Excede la capacidad por{' '}
            {totalHours - capacity} horas.
          </p>
          <button onClick={onRedistribute}>Reprogramar Tareas</button>
        </div>
      )}
    </div>
  );
};

WorkloadSummary.propTypes = {
  tasks: PropTypes.array.isRequired,
  capacity: PropTypes.number.isRequired,
  onRedistribute: PropTypes.func.isRequired,
};

export default WorkloadSummary;
