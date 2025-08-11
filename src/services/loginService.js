const pool = require('./db');

async function login(usuario, clave) {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE login = ? AND contrasena = ?', [usuario, clave]);
    return rows.length > 0;
  } catch (err) {
    console.error('Error en login:', err);
    return false;
  }
}

module.exports = { login };
