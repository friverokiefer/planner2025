// frontend/src/components/LoginForm/LoginForm.js
import { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './LoginForm.css';

function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Credentials before login:', credentials);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const data = await response.json();
      // Llama a onLogin con el token, que ahora actualiza el estado en App.js
      onLogin(data.token);
      console.log('Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);

      if (err.msg) {
        setError(err.msg);
      } else if (err.errors) {
        const errorMessages = err.errors.map(error => error.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(
          'Credenciales inválidas. Por favor, verifica tu correo y contraseña.'
        );
      }
    } finally {
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

      <Button
        variant="primary"
        type="submit"
        className="mt-4"
        disabled={loading}
      >
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

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginForm;
