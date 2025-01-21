// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Eliminamos <React.StrictMode> para evitar problemas con react-beautiful-dnd en desarrollo
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
