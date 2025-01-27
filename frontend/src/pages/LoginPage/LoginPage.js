// frontend/src/pages/LoginPage/LoginPage.js

import React, { useState } from 'react';
import LoginForm from '../../components/LoginForm/LoginForm'; // Ruta corregida
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await authService.login(credentials);
      if (user) {
        onLogin(user);
        setError(null);
        navigate('/'); // Redirige a la página principal o a donde desees
      }
    } catch (error) {
      // Manejar errores específicos si el backend envía mensajes
      setError(error.response?.data?.msg || error.message);
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}

export default LoginPage;
