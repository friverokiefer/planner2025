// frontend/src/components/LoginForm/LoginForm.js

import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './LoginForm.css';

function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(credentials);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Credenciales inválidas.');
      }
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="loginEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Ingrese su email"
          required
        />
      </Form.Group>

      <Form.Group controlId="loginPassword" className="mt-3">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Ingrese su contraseña"
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-4" disabled={loading}>
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
            Cargando...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </Form>
  );
}

export default LoginForm;
