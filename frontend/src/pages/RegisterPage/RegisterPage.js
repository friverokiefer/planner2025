// frontend/src/pages/RegisterPage/RegisterPage.js
import { useState } from 'react';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import './RegisterPage.css';
import PropTypes from 'prop-types';

function RegisterPage({ onLogin }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async userData => {
    try {
      const user = await authService.register(userData);
      onLogin(user); // Actualiza el estado global para marcar al usuario como autenticado
      setSuccess('Usuario registrado y autenticado con éxito.');
      setError(null);
      // Redirige a la ruta privada, por ejemplo, "/profile"
      navigate('/profile');
    } catch (error) {
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

RegisterPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default RegisterPage;
