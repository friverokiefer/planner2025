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

// Para entornos con proxy
app.set('trust proxy', 1);

// Configurar Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Configurar CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy does not allow access from this Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(express.json());

// Logger para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
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

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Manejador de errores internos
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
