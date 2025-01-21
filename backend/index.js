// backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rutas
const tasksRoutes = require('./src/routes/tasks');
const uploadRoutes = require('./src/routes/upload');
const profileRoutes = require('./src/routes/profile');
const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const friendsRoutes = require('./src/routes/friends');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet());

// CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir llamadas desde Postman, etc. (origin puede ser undefined)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `La política de CORS no permite el acceso desde el origen ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
});
app.use(limiter);

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir carpeta de uploads (para ver imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/tasks', tasksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API Planner2025');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores internos
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
