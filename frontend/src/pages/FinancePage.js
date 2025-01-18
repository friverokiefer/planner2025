// frontend/src/pages/FinancePage.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './FinancePage.css';

function FinancePage() {
  const [showModal, setShowModal] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === '1234') { // Considera utilizar variables de entorno para la contraseña
      setAuthenticated(true);
      setShowModal(false);
      setError('');
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="finance-page">
      <h1>Finance Page</h1>
      {!authenticated ? (
        <Modal show={showModal} onHide={() => {}} backdrop="static" keyboard={false} centered>
          <Modal.Header>
            <Modal.Title>Sección Protegida</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group controlId="formPassword">
                <Form.Label>Ingresa la contraseña para acceder:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              {error && <p className="text-danger mt-2">{error}</p>}
              <Button variant="primary" type="submit" className="mt-3">
                Ingresar
              </Button>
              {/* Botón para Volver a Tareas */}
              <Link to="/">
                <Button variant="secondary" className="mt-3 ms-2">
                  Volver a Tareas
                </Button>
              </Link>
            </Form>
          </Modal.Body>
        </Modal>
      ) : (
        <div className="finance-content">
          <h2>Sección de Finanzas</h2>
          <p>Esta es una sección sensible. ¡Bienvenido!</p>
          {/* Aquí puedes agregar el contenido de finanzas */}
        </div>
      )}
    </div>
  );
}

export default FinancePage;
