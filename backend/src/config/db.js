const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "tu_usuario",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "tu_basedatos",
  password: process.env.DB_PASSWORD || "tu_contraseña",
  port: process.env.DB_PORT || 5432,
});

pool.on("connect", () => {
  console.log("Backend: Conectado a la base de datos");
});

pool.on("error", (err) => {
  console.error("Backend: Error de conexión", err);
});

module.exports = pool;
