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

async function crearTrabajador(datosFormulario) {
  try {
    console.log('Creando nuevo trabajador con datos:', datosFormulario);
    
    // Generar código único para el trabajador
    const codigoNuevo = await obtenerSiguienteCodigo();
    
    const query = `
      INSERT INTO trabajadores (
        codigo,
        nombres,
        apellidos,
        tipo_dni,
        numero_documento,
        fecha_nacimiento,
        sexo,
        estado_civil,
        nacionalidad,
        direccion,
        distrito,
        provincia,
        departamento,
        telefono,
        correo,
        tipo_trabajador,
        cargo,
        area,
        fecha_ingreso,
        tipo_contrato,
        sueldo,
        regimen_laboral,
        tipo_jornada,
        turnos,
        banco,
        numero_cuenta,
        cci,
        id_sistema_pension,
        numero_afiliacion,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const valores = [
      codigoNuevo,
      datosFormulario.nombres,
      datosFormulario.apellidos,
      datosFormulario.tipoDni || 'DNI',
      datosFormulario.numeroDocumento,
      datosFormulario.fechaNacimiento || null,
      datosFormulario.sexo || null,
      datosFormulario.estadoCivil || null,
      datosFormulario.nacionalidad || 'PERUANA',
      datosFormulario.direccion || null,
      datosFormulario.distrito || null,
      datosFormulario.provincia || null,
      datosFormulario.departamento || null,
      datosFormulario.telefono || null,
      datosFormulario.correo,
      datosFormulario.tipoTrabajador || 'EMPLEADO',
      datosFormulario.cargo,
      datosFormulario.area,
      datosFormulario.fechaIngreso,
      datosFormulario.tipoContrato || 'INDEFINIDO',
      parseFloat(datosFormulario.sueldoBasico),
      datosFormulario.regimenLaboral || 'GENERAL',
      datosFormulario.tipoJornada || 'COMPLETA',
      datosFormulario.turnos || null,
      datosFormulario.banco || null,
      datosFormulario.numeroCuenta || null,
      datosFormulario.cci || null,
      datosFormulario.sistemaPension ? parseInt(datosFormulario.sistemaPension) : null,
      datosFormulario.numeroAfiliacion || null,
      'ACTIVO'
    ];
    
    const [result] = await pool.query(query, valores);
    
    console.log('Trabajador creado exitosamente con ID:', result.insertId);
    
    return {
      id: result.insertId,
      codigo: codigoNuevo,
      mensaje: 'Trabajador creado exitosamente'
    };
    
  } catch (err) {
    console.error('Error al crear trabajador:', err);
    
    // Manejar errores específicos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes('numero_documento')) {
        throw new Error('El número de documento ya existe');
      }
      if (err.sqlMessage.includes('codigo')) {
        throw new Error('El código de trabajador ya existe');
      }
    }
    
    throw new Error('Error al crear el trabajador: ' + err.message);
  }
}

async function obtenerTrabajadorPorId(id) {
  try {
    console.log('Obteniendo trabajador por ID:', id);
    
    const query = `
      SELECT 
        t.id_trabajador,
        t.codigo,
        t.nombres,
        t.apellidos,
        t.tipo_dni,
        t.numero_documento,
        t.fecha_nacimiento,
        t.sexo,
        t.estado_civil,
        t.nacionalidad,
        t.direccion,
        t.distrito,
        t.provincia,
        t.departamento,
        t.telefono,
        t.correo,
        t.tipo_trabajador,
        t.cargo,
        t.area,
        t.fecha_ingreso,
        t.tipo_contrato,
        t.sueldo,
        t.regimen_laboral,
        t.tipo_jornada,
        t.turnos,
        t.banco,
        t.numero_cuenta,
        t.cci,
        t.id_sistema_pension,
        t.numero_afiliacion,
        t.estado,
        sp.nombre as sistema_pension_nombre,
        sp.tipo as sistema_pension_tipo
      FROM trabajadores t
      LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
      WHERE t.id_trabajador = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      throw new Error('Trabajador no encontrado');
    }
    
    console.log('Trabajador obtenido:', rows[0]);
    return rows[0];
    
  } catch (err) {
    console.error('Error al obtener trabajador por ID:', err);
    throw new Error('Error al obtener el trabajador: ' + err.message);
  }
}

async function actualizarTrabajador(id, datosFormulario) {
  try {
    console.log('Actualizando trabajador ID:', id, 'con datos:', datosFormulario);
    
    const query = `
      UPDATE trabajadores SET
        nombres = ?,
        apellidos = ?,
        tipo_dni = ?,
        numero_documento = ?,
        fecha_nacimiento = ?,
        sexo = ?,
        estado_civil = ?,
        nacionalidad = ?,
        direccion = ?,
        distrito = ?,
        provincia = ?,
        departamento = ?,
        telefono = ?,
        correo = ?,
        tipo_trabajador = ?,
        cargo = ?,
        area = ?,
        fecha_ingreso = ?,
        tipo_contrato = ?,
        sueldo = ?,
        regimen_laboral = ?,
        tipo_jornada = ?,
        turnos = ?,
        banco = ?,
        numero_cuenta = ?,
        cci = ?,
        id_sistema_pension = ?,
        numero_afiliacion = ?
      WHERE id_trabajador = ?
    `;
    
    const valores = [
      datosFormulario.nombres,
      datosFormulario.apellidos,
      datosFormulario.tipoDni || 'DNI',
      datosFormulario.numeroDocumento,
      datosFormulario.fechaNacimiento || null,
      datosFormulario.sexo || null,
      datosFormulario.estadoCivil || null,
      datosFormulario.nacionalidad || 'PERUANA',
      datosFormulario.direccion || null,
      datosFormulario.distrito || null,
      datosFormulario.provincia || null,
      datosFormulario.departamento || null,
      datosFormulario.telefono || null,
      datosFormulario.correo,
      datosFormulario.tipoTrabajador || 'EMPLEADO',
      datosFormulario.cargo,
      datosFormulario.area,
      datosFormulario.fechaIngreso,
      datosFormulario.tipoContrato || 'INDEFINIDO',
      parseFloat(datosFormulario.sueldoBasico),
      datosFormulario.regimenLaboral || 'GENERAL',
      datosFormulario.tipoJornada || 'COMPLETA',
      datosFormulario.turnos || null,
      datosFormulario.banco || null,
      datosFormulario.numeroCuenta || null,
      datosFormulario.cci || null,
      datosFormulario.sistemaPension ? parseInt(datosFormulario.sistemaPension) : null,
      datosFormulario.numeroAfiliacion || null,
      id
    ];
    
    const [result] = await pool.query(query, valores);
    
    if (result.affectedRows === 0) {
      throw new Error('Trabajador no encontrado');
    }
    
    console.log('Trabajador actualizado exitosamente');
    
    return {
      id: id,
      mensaje: 'Trabajador actualizado exitosamente'
    };
    
  } catch (err) {
    console.error('Error al actualizar trabajador:', err);
    
    // Manejar errores específicos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes('numero_documento')) {
        throw new Error('El número de documento ya existe');
      }
    }
    
    throw new Error('Error al actualizar el trabajador: ' + err.message);
  }
}

async function obtenerSiguienteCodigo() {
  try {
    const [rows] = await pool.query(
      'SELECT MAX(codigo) as maxCodigo FROM trabajadores'
    );
    
    const maxCodigo = rows[0].maxCodigo || 1000;
    return maxCodigo + 1;
    
  } catch (err) {
    console.error('Error al obtener siguiente código:', err);
    // Si hay error, empezar desde 1001
    return 1001;
  }
}

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  crearTrabajador,
  actualizarTrabajador
};