// frontend/src/components/Timer/Timer.js
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './Timer.css';

function Timer({ onStop }) {
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let interval = null;
    if (active) {
      interval = setInterval(() => {
        setSeconds((sec) => sec + 1);
      }, 1000);
    } else if (!active && seconds !== 0) {
      clearInterval(interval);
      if (onStop) onStop(seconds / 3600); // Convertir a horas (decimales)
    }
    return () => clearInterval(interval);
  }, [active, seconds, onStop]);

  const handleStop = () => {
    setActive(false);
  };

  return (
    <div className="timer">
      <h5>Temporizador: {formatTime(seconds)}</h5>
      <Button variant="danger" onClick={handleStop}>
        Detener Temporizador
      </Button>
    </div>
  );
}

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const pad = (num) => String(num).padStart(2, '0');

export default Timer;
