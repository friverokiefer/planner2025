// frontend/src/index.js
import ReactDOM from 'react-dom/client'; // React 18
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Asegúrate de importar los estilos globales

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>//
  <App />
  //</React.StrictMode>//
);
