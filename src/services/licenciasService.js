const pool = require('./db');

class LicenciasService {
  
  // Obtener todas las licencias con información del trabajador y tipo
  async obtenerLicencias(filtros = {}) {
    try {
      let query = `
        SELECT 
          l.id_licencia,
          l.id_trabajador,
          l.id_tipo_licencia,
          l.fecha_inicio,
          l.fecha_fin,
          l.dias,
          l.motivo,
          l.estado,
          CONCAT(t.nombres, ' ', t.apellidos) as trabajador_nombre,
          t.codigo as trabajador_codigo,
          t.area as trabajador_area,
          tl.nombre as tipo_licencia_nombre,
          tl.descripcion as tipo_licencia_descripcion
        FROM licencia l
        INNER JOIN trabajadores t ON l.id_trabajador = t.id_trabajador
        INNER JOIN tipo_licencia tl ON l.id_tipo_licencia = tl.id_tipo_licencia
        WHERE 1=1
      `;
      
      const params = [];
      
      // Aplicar filtros
      if (filtros.estado) {
        query += ' AND l.estado = ?';
        params.push(filtros.estado);
      }
      
      if (filtros.busqueda) {
        query += ' AND (CONCAT(t.nombres, " ", t.apellidos) LIKE ? OR tl.nombre LIKE ?)';
        const busquedaParam = `%${filtros.busqueda}%`;
        params.push(busquedaParam, busquedaParam);
      }
      
      if (filtros.trabajador) {
        query += ' AND l.id_trabajador = ?';
        params.push(filtros.trabajador);
      }
      
      query += ' ORDER BY l.fecha_inicio DESC';
      
      const [rows] = await pool.execute(query, params);
      
      return {
        success: true,
        licencias: rows
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error obteniendo licencias:', error);
      throw error;
    }
  }
  
  // Obtener licencia por ID
  async obtenerLicenciaPorId(idLicencia) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          l.id_licencia,
          l.id_trabajador,
          l.id_tipo_licencia,
          l.fecha_inicio,
          l.fecha_fin,
          l.dias,
          l.motivo,
          l.estado,
          CONCAT(t.nombres, ' ', t.apellidos) as trabajador_nombre,
          t.codigo as trabajador_codigo,
          tl.nombre as tipo_licencia_nombre,
          tl.descripcion as tipo_licencia_descripcion
        FROM licencia l
        INNER JOIN trabajadores t ON l.id_trabajador = t.id_trabajador
        INNER JOIN tipo_licencia tl ON l.id_tipo_licencia = tl.id_tipo_licencia
        WHERE l.id_licencia = ?
      `, [idLicencia]);
      
      if (rows.length === 0) {
        return { success: false, error: 'Licencia no encontrada' };
      }
      
      return {
        success: true,
        licencia: rows[0]
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error obteniendo licencia por ID:', error);
      throw error;
    }
  }
  
  // Crear nueva licencia
  async crearLicencia(datosLicencia) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        idTrabajador,
        idTipoLicencia,
        fechaInicio,
        fechaFin,
        motivo,
        estado = 'PENDIENTE'
      } = datosLicencia;
      
      // Validar datos requeridos
      if (!idTrabajador) throw new Error('ID del trabajador es requerido');
      if (!idTipoLicencia) throw new Error('Tipo de licencia es requerido');
      if (!fechaInicio) throw new Error('Fecha de inicio es requerida');
      if (!fechaFin) throw new Error('Fecha de fin es requerida');
      
      // Validar que la fecha de fin sea posterior a la de inicio
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      // Insertar nueva licencia
      const [result] = await connection.execute(`
        INSERT INTO licencia (
          id_trabajador,
          id_tipo_licencia,
          fecha_inicio,
          fecha_fin,
          motivo,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        idTrabajador,
        idTipoLicencia,
        fechaInicio,
        fechaFin,
        motivo || null,
        estado
      ]);
      
      await connection.commit();
      
      return {
        success: true,
        id_licencia: result.insertId,
        message: 'Licencia creada exitosamente'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('[LicenciasService] Error creando licencia:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Actualizar licencia
  async actualizarLicencia(idLicencia, datosLicencia) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        idTrabajador,
        idTipoLicencia,
        fechaInicio,
        fechaFin,
        motivo,
        estado
      } = datosLicencia;
      
      // Validar que la fecha de fin sea posterior a la de inicio
      if (fechaFin && fechaInicio && new Date(fechaFin) < new Date(fechaInicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      
      const [result] = await connection.execute(`
        UPDATE licencia SET
          id_trabajador = ?,
          id_tipo_licencia = ?,
          fecha_inicio = ?,
          fecha_fin = ?,
          motivo = ?,
          estado = ?
        WHERE id_licencia = ?
      `, [
        idTrabajador,
        idTipoLicencia,
        fechaInicio,
        fechaFin,
        motivo || null,
        estado,
        idLicencia
      ]);
      
      if (result.affectedRows === 0) {
        throw new Error('Licencia no encontrada');
      }
      
      await connection.commit();
      
      return {
        success: true,
        message: 'Licencia actualizada exitosamente'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('[LicenciasService] Error actualizando licencia:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Eliminar licencia
  async eliminarLicencia(idLicencia) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM licencia WHERE id_licencia = ?',
        [idLicencia]
      );
      
      if (result.affectedRows === 0) {
        return { success: false, error: 'Licencia no encontrada' };
      }
      
      return {
        success: true,
        message: 'Licencia eliminada exitosamente'
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error eliminando licencia:', error);
      throw error;
    }
  }
  
  // Actualizar solo el estado de una licencia
  async actualizarEstadoLicencia(idLicencia, nuevoEstado) {
    try {
      const estadosValidos = ['PENDIENTE', 'ACTIVA', 'CONCLUIDA', 'CANCELADA'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
      }
      
      const [result] = await pool.execute(`
        UPDATE licencia SET estado = ?
        WHERE id_licencia = ?
      `, [nuevoEstado, idLicencia]);
      
      if (result.affectedRows === 0) {
        return { success: false, error: 'Licencia no encontrada' };
      }
      
      return {
        success: true,
        message: `Estado actualizado a ${nuevoEstado}`
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error actualizando estado:', error);
      throw error;
    }
  }
  
  // Obtener tipos de licencia
  async obtenerTiposLicencia() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id_tipo_licencia,
          nombre,
          descripcion
        FROM tipo_licencia
        ORDER BY nombre
      `);
      
      return {
        success: true,
        tipos: rows
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error obteniendo tipos de licencia:', error);
      throw error;
    }
  }
  
  // Obtener estadísticas de licencias
  async obtenerEstadisticas() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_licencias,
          COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'ACTIVA' THEN 1 END) as activas,
          COUNT(CASE WHEN estado = 'CONCLUIDA' THEN 1 END) as concluidas,
          COUNT(CASE WHEN estado = 'CANCELADA' THEN 1 END) as canceladas
        FROM licencia
      `);
      
      return {
        success: true,
        estadisticas: stats[0]
      };
      
    } catch (error) {
      console.error('[LicenciasService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new LicenciasService();
