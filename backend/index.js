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

// (opcional) Para que Express confíe en proxies si usas Heroku, etc.
app.set('trust proxy', 1);

/**
 * Configurar Helmet para que:
 * - No aplique contentSecurityPolicy estricto en dev.
 * - crossOriginResourcePolicy se permita cross-origin.
 */
app.use(
  helmet({
    // Desactivamos CSP en local (o lo configuramos a false)
    contentSecurityPolicy: false,
    // Permitimos que el navegador cargue recursos (imágenes) desde otro origen
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Configurar CORS (permite acceso desde http://localhost:3000 y http://localhost:5000)
app.use(
  cors({
    origin: function (origin, callback) {
      // Si no hay 'origin' (ej. Postman), permitir
      if (!origin) return callback(null, true);
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS bloqueado para la url: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Rate Limit (opcional)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes. Intenta más tarde.',
});
app.use(limiter);

app.use(express.json());

// Logger en modo dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * Servir la carpeta de subidas
 * IMPORTANTE para ver http://localhost:5000/uploads/<nombre.png>
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Rutas de la API
 */
app.use('/api/tasks', tasksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);

/**
 * Ruta raíz
 */
app.get('/', (req, res) => {
  res.send('API Planner2025');
});

/**
 * Manejo de errores 404
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

/**
 * Manejo de errores internos
 */
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ error: err.message || 'Error interno' });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
