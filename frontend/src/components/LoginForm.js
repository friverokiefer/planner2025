// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import './LoginForm.css'; // Asegúrate de tener este archivo CSS

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Ingrese su email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Iniciar Sesión
      </Button>
    </Form>
  );
}

export default LoginForm;