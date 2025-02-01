import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import StopTimerModal from "../StopTimerModal/StopTimerModal";
import './Timer.css';
import PropTypes from 'prop-types';
import taskService from '../../../services/taskService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Timer = ({ taskId, onTimeAdded }) => {
  // Al montar el componente se registra el tiempo de inicio automáticamente.
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  // Al montar el componente, iniciamos el temporizador
  useEffect(() => {
    const now = Date.now();
    setStartTime(now);
    setActive(true);
  }, []);

  // Actualiza el tiempo transcurrido cada segundo
  useEffect(() => {
    let interval = null;
    if (active && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [active, startTime]);

  const handleStopClick = () => {
    setActive(false);
    setShowStopModal(true);
  };

  const handleCloseModal = () => {
    setShowStopModal(false);
  };

  // Al confirmar la detención, se calcula end_time y se envía el payload
  const handleConfirmStop = async (comment) => {
    if (!startTime) {
      toast.error('No se registró el tiempo de inicio.');
      return;
    }
    const endTime = Date.now();
    if (endTime <= startTime) {
      toast.error('El tiempo transcurrido debe ser mayor a 0 segundos.');
      return;
    }
    try {
      const payload = {
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        comment: comment || ""
      };
      const response = await taskService.addTimeToTask(taskId, payload);
      if (response && response.data) {
        toast.success('Tiempo agregado exitosamente');
        onTimeAdded(response.data);
      } else {
        toast.error('Error: Respuesta vacía del servidor.');
      }
    } catch (error) {
      console.error('Error al agregar tiempo trabajado:', error);
      toast.error(error.response?.data?.error || 'Error al agregar tiempo trabajado');
    }
    setShowStopModal(false);
  };

  return (
    <div className="timer-container">
      <ToastContainer />
      <p>Temporizador: {formatTime(elapsed)}</p>
      <Button variant="warning" onClick={handleStopClick}>
        Detener Temporizador
      </Button>
      <StopTimerModal
        show={showStopModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStop}
        timeSpent={elapsed / 3600}
      />
    </div>
  );
};

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return String(num).padStart(2, '0');
}

Timer.propTypes = {
  taskId: PropTypes.number.isRequired,
  onTimeAdded: PropTypes.func.isRequired,
};

export default Timer;
