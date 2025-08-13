const pool = require('./db');

async function obtenerSistemasPension() {
  try {
    console.log('Obteniendo sistemas de pensión...');
    
    const query = `
      SELECT 
        sp.id_sistema_pension,
        sp.nombre,
        sp.tipo,
        sp.codigo_sap,
        da.fondo,
        da.comision,
        da.tipo_comision,
        da.seguro,
        do_.porcentaje
      FROM sistema_pension sp
      LEFT JOIN detalle_afp da ON sp.id_sistema_pension = da.id_sistema_pension
      LEFT JOIN detalle_onp do_ ON sp.id_sistema_pension = do_.id_sistema_pension
      ORDER BY sp.nombre
    `;
    
    const [rows] = await pool.query(query);
    console.log('Sistemas obtenidos:', rows.length);
    
    return rows;
    
  } catch (err) {
    console.error('Error al obtener sistemas de pensión:', err);
    throw new Error('Error al obtener los sistemas de pensión: ' + err.message);
  }
}

async function obtenerSistemaPorId(id) {
  try {
    console.log('Obteniendo sistema de pensión por ID:', id);
    
    const query = `
      SELECT 
        sp.id_sistema_pension,
        sp.nombre,
        sp.tipo,
        sp.codigo_sap,
        da.fondo,
        da.comision,
        da.tipo_comision,
        da.seguro,
        do_.porcentaje
      FROM sistema_pension sp
      LEFT JOIN detalle_afp da ON sp.id_sistema_pension = da.id_sistema_pension
      LEFT JOIN detalle_onp do_ ON sp.id_sistema_pension = do_.id_sistema_pension
      WHERE sp.id_sistema_pension = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      throw new Error('Sistema de pensión no encontrado');
    }
    
    console.log('Sistema obtenido:', rows[0]);
    return rows[0];
    
  } catch (err) {
    console.error('Error al obtener sistema por ID:', err);
    throw new Error('Error al obtener el sistema de pensión: ' + err.message);
  }
}

async function crearSistemaPension(datos) {
  const connection = await pool.getConnection();
  
  try {
    console.log('Creando nuevo sistema de pensión:', datos);
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Insertar el sistema de pensión principal
    const querySistema = `
      INSERT INTO sistema_pension (nombre, tipo, codigo_sap)
      VALUES (?, ?, ?)
    `;
    
    const [resultSistema] = await connection.query(querySistema, [
      datos.nombre,
      datos.tipo,
      datos.codigo_sap || null
    ]);
    
    const idSistemaPension = resultSistema.insertId;
    console.log('Sistema de pensión creado con ID:', idSistemaPension);
    
    // Insertar detalles según el tipo
    if (datos.tipo === 'AFP') {
      const queryAfp = `
        INSERT INTO detalle_afp (id_sistema_pension, fondo, comision, tipo_comision, seguro)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await connection.query(queryAfp, [
        idSistemaPension,
        parseFloat(datos.fondo_afp) || 10.00,
        parseFloat(datos.comision_afp) || 0.00,
        datos.tipo_comision || 'FLUJO',
        parseFloat(datos.seguro_afp) || 0.00
      ]);
      
      console.log('Detalles AFP creados exitosamente');
      
    } else if (datos.tipo === 'ONP') {
      const queryOnp = `
        INSERT INTO detalle_onp (id_sistema_pension, porcentaje)
        VALUES (?, ?)
      `;
      
      await connection.query(queryOnp, [
        idSistemaPension,
        parseFloat(datos.porcentaje_onp) || 13.00
      ]);
      
      console.log('Detalles ONP creados exitosamente');
    }
    
    // Confirmar transacción
    await connection.commit();
    
    return {
      id: idSistemaPension,
      mensaje: 'Sistema de pensión creado exitosamente'
    };
    
  } catch (err) {
    // Rollback en caso de error
    await connection.rollback();
    console.error('Error al crear sistema de pensión:', err);
    
    // Manejar errores específicos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes('nombre')) {
        throw new Error('Ya existe un sistema con ese nombre');
      }
      if (err.sqlMessage.includes('codigo_sap')) {
        throw new Error('El código SAP ya existe');
      }
    }
    
    throw new Error('Error al crear el sistema de pensión: ' + err.message);
    
  } finally {
    connection.release();
  }
}

async function actualizarSistemaPension(id, datos) {
  const connection = await pool.getConnection();
  
  try {
    console.log('Actualizando sistema de pensión ID:', id, 'con datos:', datos);
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Actualizar el sistema principal
    const querySistema = `
      UPDATE sistema_pension 
      SET nombre = ?, tipo = ?, codigo_sap = ?
      WHERE id_sistema_pension = ?
    `;
    
    await connection.query(querySistema, [
      datos.nombre,
      datos.tipo,
      datos.codigo_sap || null,
      id
    ]);
    
    // Eliminar detalles existentes
    await connection.query('DELETE FROM detalle_afp WHERE id_sistema_pension = ?', [id]);
    await connection.query('DELETE FROM detalle_onp WHERE id_sistema_pension = ?', [id]);
    
    // Insertar nuevos detalles según el tipo
    if (datos.tipo === 'AFP') {
      const queryAfp = `
        INSERT INTO detalle_afp (id_sistema_pension, fondo, comision, tipo_comision, seguro)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await connection.query(queryAfp, [
        id,
        parseFloat(datos.fondo_afp) || 10.00,
        parseFloat(datos.comision_afp) || 0.00,
        datos.tipo_comision || 'FLUJO',
        parseFloat(datos.seguro_afp) || 0.00
      ]);
      
    } else if (datos.tipo === 'ONP') {
      const queryOnp = `
        INSERT INTO detalle_onp (id_sistema_pension, porcentaje)
        VALUES (?, ?)
      `;
      
      await connection.query(queryOnp, [
        id,
        parseFloat(datos.porcentaje_onp) || 13.00
      ]);
    }
    
    // Confirmar transacción
    await connection.commit();
    
    return {
      id: id,
      mensaje: 'Sistema de pensión actualizado exitosamente'
    };
    
  } catch (err) {
    await connection.rollback();
    console.error('Error al actualizar sistema de pensión:', err);
    throw new Error('Error al actualizar el sistema de pensión: ' + err.message);
    
  } finally {
    connection.release();
  }
}

async function eliminarSistemaPension(id) {
  const connection = await pool.getConnection();
  
  try {
    console.log('Eliminando sistema de pensión ID:', id);
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Eliminar detalles primero (por foreign key constraints)
    await connection.query('DELETE FROM detalle_afp WHERE id_sistema_pension = ?', [id]);
    await connection.query('DELETE FROM detalle_onp WHERE id_sistema_pension = ?', [id]);
    
    // Eliminar el sistema principal
    const [result] = await connection.query('DELETE FROM sistema_pension WHERE id_sistema_pension = ?', [id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Sistema de pensión no encontrado');
    }
    
    // Confirmar transacción
    await connection.commit();
    
    console.log('Sistema de pensión eliminado exitosamente');
    
    return {
      mensaje: 'Sistema de pensión eliminado exitosamente'
    };
    
  } catch (err) {
    await connection.rollback();
    console.error('Error al eliminar sistema de pensión:', err);
    
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar el sistema porque está siendo usado por trabajadores');
    }
    
    throw new Error('Error al eliminar el sistema de pensión: ' + err.message);
    
  } finally {
    connection.release();
  }
}

module.exports = {
  obtenerSistemasPension,
  obtenerSistemaPorId,
  crearSistemaPension,
  actualizarSistemaPension,
  eliminarSistemaPension
};
