// frontend/src/pages/RegisterPage/RegisterPage.js

import React, { useState } from 'react';
import RegisterForm from '../../components/RegisterForm/RegisterForm'; // Ruta corregida
import authService from '../../services/authService'; 
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import './RegisterPage.css';

function RegisterPage({ onLogin }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      const user = await authService.register(userData);
      onLogin(user); // Autenticación automática después del registro
      setSuccess('Usuario registrado y autenticado con éxito.');
      setError(null);
      navigate('/'); // Redirige a la página principal o a donde desees
    } catch (error) {
      // Manejar errores específicos si el backend envía mensajes
      setError(error.response?.data?.msg || error.message);
      setSuccess(null);
    }
  };

  return (
    <div>
      <h1>Registrarse</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}

export default RegisterPage;
