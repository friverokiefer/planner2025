// frontend/src/components/RegisterForm/RegisterForm.js

import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './RegisterForm.css';

function RegisterForm({ onRegister }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    try {
      await onRegister(userData);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrar el usuario.');
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="register-form">
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="registerName">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          placeholder="Ingrese su nombre"
          required
        />
      </Form.Group>

      <Form.Group controlId="registerEmail" className="mt-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Ingrese su email"
          required
        />
      </Form.Group>

      <Form.Group controlId="registerPassword" className="mt-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Ingrese su contraseña"
          required
        />
      </Form.Group>

      <Form.Group controlId="registerConfirmPassword" className="mt-3">
        <Form.Label>Confirmar Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={userData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirme su contraseña"
          required
        />
      </Form.Group>

      <Button variant="success" type="submit" className="mt-4" disabled={loading}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
            Registrando...
          </>
        ) : (
          'Registrarse'
        )}
      </Button>
    </Form>
  );
}

export default RegisterForm;
