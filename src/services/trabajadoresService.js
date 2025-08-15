const pool = require('./db');

async function obtenerTrabajadores() {
  try {
    console.log('Ejecutando consulta SQL para obtener trabajadores...');
    const [rows] = await pool.query(`
      SELECT 
        t.id_trabajador,
        t.codigo,
        t.nombres,
        t.apellidos,
        t.numero_documento,
        t.area,
        t.cargo,
        t.sueldo,
        t.estado,
        t.correo,
        t.id_sistema_pension,
        sp.nombre as sistema_pension_nombre,
        sp.tipo as sistema_pension_tipo
      FROM trabajadores t
      LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
      ORDER BY t.nombres ASC
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
        fecha_cese,
        sueldo,
        regimen_laboral,
        tipo_jornada,
        turnos,
        banco,
        numero_cuenta,
        cci,
        id_sistema_pension,
        numero_afiliacion,
        asignacion_familiar,
        cantidad_hijos,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      datosFormulario.fechaCese || null,
      parseFloat(datosFormulario.sueldoBasico),
      datosFormulario.regimenLaboral || 'GENERAL',
      datosFormulario.tipoJornada || 'COMPLETA',
      datosFormulario.turnos || null,
      datosFormulario.banco || null,
      datosFormulario.numeroCuenta || null,
      datosFormulario.cci || null,
      datosFormulario.sistemaPension ? parseInt(datosFormulario.sistemaPension) : null,
      datosFormulario.numeroAfiliacion || null,
      datosFormulario.asignacionFamiliar === 'on' ? 1 : 0, // Convertir checkbox a booleano
      parseInt(datosFormulario.cantidadHijos) || 0, // Asegurar que sea número
      'ACTIVO'
    ];
    
    const [result] = await pool.query(query, valores);
    
    console.log('Trabajador creado exitosamente con ID:', result.insertId);

    // **PASO IMPORTANTE: Asignar ESSALUD automáticamente a todos los trabajadores**
    await asignarESSALUDAutomatico(result.insertId);
    
    // **Si tiene asignación familiar, crear el registro en trabajador_conceptos**
    if (datosFormulario.asignacionFamiliar === 'on' && parseInt(datosFormulario.cantidadHijos) > 0) {
      await asignarAsignacionFamiliar(result.insertId);
    }
    
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
        t.fecha_cese,
        t.sueldo,
        t.regimen_laboral,
        t.tipo_jornada,
        t.turnos,
        t.banco,
        t.numero_cuenta,
        t.cci,
        t.id_sistema_pension,
        t.numero_afiliacion,
        t.asignacion_familiar,
        t.cantidad_hijos,
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
        fecha_cese = ?,
        sueldo = ?,
        regimen_laboral = ?,
        tipo_jornada = ?,
        turnos = ?,
        banco = ?,
        numero_cuenta = ?,
        cci = ?,
        id_sistema_pension = ?,
        numero_afiliacion = ?,
        asignacion_familiar = ?,
        cantidad_hijos = ?
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
      datosFormulario.fechaCese || null,
      parseFloat(datosFormulario.sueldoBasico),
      datosFormulario.regimenLaboral || 'GENERAL',
      datosFormulario.tipoJornada || 'COMPLETA',
      datosFormulario.turnos || null,
      datosFormulario.banco || null,
      datosFormulario.numeroCuenta || null,
      datosFormulario.cci || null,
      datosFormulario.sistemaPension ? parseInt(datosFormulario.sistemaPension) : null,
      datosFormulario.numeroAfiliacion || null,
      datosFormulario.asignacionFamiliar === 'on' ? 1 : 0, // Convertir checkbox a booleano
      parseInt(datosFormulario.cantidadHijos) || 0, // Asegurar que sea número
      id
    ];
    
    const [result] = await pool.query(query, valores);
    
    if (result.affectedRows === 0) {
      throw new Error('Trabajador no encontrado');
    }

    // **Gestión de Asignación Familiar en actualización**
    const tieneAsignacion = datosFormulario.asignacionFamiliar === 'on';
    const cantidadHijos = parseInt(datosFormulario.cantidadHijos) || 0;
    
    if (tieneAsignacion && cantidadHijos > 0) {
      // Asignar asignación familiar si no la tiene
      await asignarAsignacionFamiliar(id);
    } else {
      // Remover asignación familiar si no cumple condiciones
      await removerAsignacionFamiliar(id);
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

async function obtenerTrabajadoresParaPlanilla() {
  try {
    console.log('Ejecutando consulta SQL para obtener trabajadores para planilla...');
    const [rows] = await pool.query(`
      SELECT 
        t.id_trabajador,
        t.codigo,
        t.nombres,
        t.apellidos,
        t.area,
        t.cargo,
        t.sueldo,
        t.estado,
        t.id_sistema_pension,
        sp.nombre as sistema_pension_nombre,
        sp.tipo as sistema_pension_tipo
      FROM trabajadores t
      LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
      WHERE t.estado = 'ACTIVO'
      ORDER BY t.area ASC, t.nombres ASC, t.apellidos ASC
    `);
    
    console.log(`Encontrados ${rows.length} trabajadores activos para planilla`);
    return rows;
  } catch (err) {
    console.error('Error al obtener trabajadores para planilla:', err);
    throw err;
  }
}

async function obtenerTrabajadoresPorArea() {
  try {
    console.log('Ejecutando consulta SQL para obtener trabajadores agrupados por área...');
    const [rows] = await pool.query(`
      SELECT 
        area,
        COUNT(*) as cantidad_trabajadores
      FROM trabajadores 
      WHERE estado = 'ACTIVO'
      GROUP BY area
      ORDER BY area ASC
    `);
    
    console.log('Trabajadores por área:', rows);
    return rows;
  } catch (err) {
    console.error('Error al obtener trabajadores por área:', err);
    throw err;
  }
}

// **FUNCIÓN PARA ASIGNAR ESSALUD AUTOMÁTICAMENTE**
async function asignarESSALUDAutomatico(idTrabajador) {
  try {
    console.log(`Asignando ESSALUD automáticamente al trabajador ID: ${idTrabajador}`);
    
    // Buscar el concepto de ESSALUD (ID = 2 según tu base de datos)
    const [conceptoESSALUD] = await pool.query(
      'SELECT id_concepto FROM conceptos WHERE codigo = "301" AND nombre = "ESSALUD" LIMIT 1'
    );
    
    if (conceptoESSALUD.length === 0) {
      console.error('No se encontró el concepto ESSALUD en la base de datos');
      return;
    }
    
    const idConceptoESSALUD = conceptoESSALUD[0].id_concepto;
    
    // Verificar si ya existe la relación
    const [existeRelacion] = await pool.query(
      'SELECT id_trabajador_concepto FROM trabajador_conceptos WHERE id_trabajador = ? AND id_concepto = ?',
      [idTrabajador, idConceptoESSALUD]
    );
    
    if (existeRelacion.length === 0) {
      // Crear la relación trabajador-concepto para ESSALUD
      await pool.query(
        'INSERT INTO trabajador_conceptos (id_trabajador, id_concepto, fecha_asignacion) VALUES (?, ?, NOW())',
        [idTrabajador, idConceptoESSALUD]
      );
      console.log(`ESSALUD asignado exitosamente al trabajador ${idTrabajador}`);
    } else {
      console.log(`ESSALUD ya estaba asignado al trabajador ${idTrabajador}`);
    }
    
  } catch (err) {
    console.error('Error al asignar ESSALUD automáticamente:', err);
    throw err;
  }
}

// **FUNCIÓN PARA ASIGNAR ASIGNACIÓN FAMILIAR**
async function asignarAsignacionFamiliar(idTrabajador) {
  try {
    console.log(`Asignando Asignación Familiar al trabajador ID: ${idTrabajador}`);
    
    // Buscar el concepto de Asignación Familiar (ID = 6 según tu base de datos)
    const [conceptoAsignacion] = await pool.query(
      'SELECT id_concepto FROM conceptos WHERE codigo = "022" AND nombre = "Asignación Familiar" LIMIT 1'
    );
    
    if (conceptoAsignacion.length === 0) {
      console.error('No se encontró el concepto Asignación Familiar en la base de datos');
      return;
    }
    
    const idConceptoAsignacion = conceptoAsignacion[0].id_concepto;
    
    // Verificar si ya existe la relación
    const [existeRelacion] = await pool.query(
      'SELECT id_trabajador_concepto FROM trabajador_conceptos WHERE id_trabajador = ? AND id_concepto = ?',
      [idTrabajador, idConceptoAsignacion]
    );
    
    if (existeRelacion.length === 0) {
      // Crear la relación trabajador-concepto para Asignación Familiar
      await pool.query(
        'INSERT INTO trabajador_conceptos (id_trabajador, id_concepto, fecha_asignacion) VALUES (?, ?, NOW())',
        [idTrabajador, idConceptoAsignacion]
      );
      console.log(`Asignación Familiar asignada exitosamente al trabajador ${idTrabajador}`);
    } else {
      console.log(`Asignación Familiar ya estaba asignada al trabajador ${idTrabajador}`);
    }
    
  } catch (err) {
    console.error('Error al asignar Asignación Familiar:', err);
    throw err;
  }
}

// **FUNCIÓN PARA REMOVER ASIGNACIÓN FAMILIAR**
async function removerAsignacionFamiliar(idTrabajador) {
  try {
    console.log(`Removiendo Asignación Familiar del trabajador ID: ${idTrabajador}`);
    
    // Buscar el concepto de Asignación Familiar
    const [conceptoAsignacion] = await pool.query(
      'SELECT id_concepto FROM conceptos WHERE codigo = "022" AND nombre = "Asignación Familiar" LIMIT 1'
    );
    
    if (conceptoAsignacion.length === 0) {
      console.log('No se encontró el concepto Asignación Familiar en la base de datos');
      return;
    }
    
    const idConceptoAsignacion = conceptoAsignacion[0].id_concepto;
    
    // Eliminar la relación trabajador-concepto para Asignación Familiar
    const [result] = await pool.query(
      'DELETE FROM trabajador_conceptos WHERE id_trabajador = ? AND id_concepto = ?',
      [idTrabajador, idConceptoAsignacion]
    );
    
    if (result.affectedRows > 0) {
      console.log(`Asignación Familiar removida exitosamente del trabajador ${idTrabajador}`);
    } else {
      console.log(`No se encontró Asignación Familiar asignada al trabajador ${idTrabajador}`);
    }
    
  } catch (err) {
    console.error('Error al remover Asignación Familiar:', err);
    throw err;
  }
}

module.exports = {
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
  crearTrabajador,
  actualizarTrabajador,
  obtenerTrabajadoresParaPlanilla,
  obtenerTrabajadoresPorArea,
  asignarESSALUDAutomatico,
  asignarAsignacionFamiliar,
  removerAsignacionFamiliar
};