// backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const tasksRoutes = require('./src/routes/tasks');
const uploadRoutes = require('./src/routes/upload');
const profileRoutes = require('./src/routes/profile'); // Importar las rutas del perfil
const morgan = require('morgan'); // Para logging de solicitudes
const helmet = require('helmet'); // Para mejorar la seguridad
const rateLimit = require('express-rate-limit'); // Para limitar el número de solicitudes
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar 'trust proxy' si se está detrás de un proxy (como en producción)
app.set('trust proxy', 1); // Ajusta según tu configuración de despliegue

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000']; // Añadimos 'http://localhost:5000'
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (ej., herramientas como Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `La política de CORS no permite el acceso desde el origen ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Middleware para limitar las solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por IP
  message:
    'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging de solicitudes HTTP en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir archivos estáticos desde 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/tasks', tasksRoutes);
app.use('/api/upload', uploadRoutes); // Utilizar la nueva ruta de subida
app.use('/api/profile', profileRoutes); // Utilizar las rutas del perfil

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API Planner2025');
});

// Middleware de manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
