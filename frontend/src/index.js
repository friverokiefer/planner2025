// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Para usar React 18
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importación de Bootstrap

const root = ReactDOM.createRoot(document.getElementById('root'));

// Eliminamos <React.StrictMode> para evitar problemas con react-beautiful-dnd en desarrollo
root.render(
  <App />
);
