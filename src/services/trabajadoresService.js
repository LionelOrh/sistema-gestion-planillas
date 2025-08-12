const pool = require('./db');

async function obtenerTrabajadores() {
  try {
    console.log('Ejecutando consulta SQL para obtener trabajadores...');
    const [rows] = await pool.query(`
      SELECT 
        id_trabajador,
        codigo,
        nombres,
        apellidos,
        numero_documento,
        area,
        cargo,
        sueldo,
        estado,
        correo
      FROM trabajadores 
      ORDER BY nombres ASC
    `);
    console.log('Resultados de la consulta:', rows);
    return rows;
  } catch (err) {
    console.error('Error al obtener trabajadores:', err);
    throw err;
  }
}

module.exports = {
  obtenerTrabajadores
};