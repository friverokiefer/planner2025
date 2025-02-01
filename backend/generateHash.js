// backend/generateHash.js
const bcrypt = require('bcrypt');

const password = 'TuContraseñaSegura'; // Reemplaza con la contraseña deseada

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error al generar el hash:', err);
  } else {
    console.log('Hash de la contraseña:', hash);
  }
});
