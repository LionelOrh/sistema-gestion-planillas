const db = require('./db');

class TrabajadorConceptosService {
  
  // Asignar un concepto a un trabajador
  async asignarConcepto(idTrabajador, idConcepto) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Verificar si el concepto ya está asignado al trabajador
      const [existing] = await connection.execute(
        'SELECT id_trabajador_concepto FROM trabajador_conceptos WHERE id_trabajador = ? AND id_concepto = ? AND activo = TRUE',
        [idTrabajador, idConcepto]
      );
      
      if (existing.length > 0) {
        throw new Error('Este concepto ya está asignado al trabajador');
      }
      
      // Verificar que el trabajador existe
      const [trabajador] = await connection.execute(
        'SELECT id_trabajador FROM trabajadores WHERE id_trabajador = ?',
        [idTrabajador]
      );
      
      if (trabajador.length === 0) {
        throw new Error('Trabajador no encontrado');
      }
      
      // Verificar que el concepto existe y está activo
      const [concepto] = await connection.execute(
        'SELECT id_concepto FROM conceptos WHERE id_concepto = ? AND activo = TRUE',
        [idConcepto]
      );
      
      if (concepto.length === 0) {
        throw new Error('Concepto no encontrado o inactivo');
      }
      
      // Insertar la asignación
      const [result] = await connection.execute(
        'INSERT INTO trabajador_conceptos (id_trabajador, id_concepto, fecha_asignacion, activo) VALUES (?, ?, NOW(), TRUE)',
        [idTrabajador, idConcepto]
      );
      
      await connection.commit();
      
      console.log(`Concepto ${idConcepto} asignado al trabajador ${idTrabajador} exitosamente`);
      
      return {
        success: true,
        message: 'Concepto asignado exitosamente',
        data: {
          id_trabajador_concepto: result.insertId,
          id_trabajador: idTrabajador,
          id_concepto: idConcepto
        }
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al asignar concepto:', error);
      
      return {
        success: false,
        message: error.message
      };
    } finally {
      connection.release();
    }
  }
  
  // Obtener conceptos asignados a un trabajador con información del concepto
  async obtenerConceptosAsignados(idTrabajador) {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          tc.id_trabajador_concepto,
          tc.id_trabajador,
          tc.id_concepto,
          tc.fecha_asignacion,
          c.codigo,
          c.nombre,
          c.tipo,
          c.tipo_calculo,
          c.valor,
          c.es_remunerativo
        FROM trabajador_conceptos tc
        INNER JOIN conceptos c ON tc.id_concepto = c.id_concepto
        WHERE tc.id_trabajador = ? AND tc.activo = TRUE AND c.activo = TRUE
        ORDER BY c.tipo, c.nombre`,
        [idTrabajador]
      );
      
      console.log(`Se encontraron ${rows.length} conceptos asignados al trabajador ${idTrabajador}`);
      return rows;
      
    } catch (error) {
      console.error('Error al obtener conceptos asignados:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Desvincular un concepto de un trabajador
  async desvincularConcepto(idTrabajador, idConcepto) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Verificar que la asignación existe
      const [existing] = await connection.execute(
        'SELECT id_trabajador_concepto FROM trabajador_conceptos WHERE id_trabajador = ? AND id_concepto = ? AND activo = TRUE',
        [idTrabajador, idConcepto]
      );
      
      if (existing.length === 0) {
        throw new Error('No se encontró la asignación del concepto al trabajador');
      }
      
      // Marcar como inactivo (soft delete)
      await connection.execute(
        'UPDATE trabajador_conceptos SET activo = FALSE, updated_at = NOW() WHERE id_trabajador = ? AND id_concepto = ? AND activo = TRUE',
        [idTrabajador, idConcepto]
      );
      
      await connection.commit();
      
      console.log(`Concepto ${idConcepto} desvinculado del trabajador ${idTrabajador} exitosamente`);
      
      return {
        success: true,
        message: 'Concepto desvinculado exitosamente'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al desvincular concepto:', error);
      
      return {
        success: false,
        message: error.message
      };
    } finally {
      connection.release();
    }
  }
  
  // Obtener estadísticas de asignaciones
  async obtenerEstadisticas() {
    const connection = await db.getConnection();
    try {
      const [stats] = await connection.execute(
        `SELECT 
          COUNT(*) as total_asignaciones,
          COUNT(DISTINCT id_trabajador) as trabajadores_con_conceptos,
          COUNT(DISTINCT id_concepto) as conceptos_asignados
        FROM trabajador_conceptos 
        WHERE activo = TRUE`
      );
      
      return stats[0];
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new TrabajadorConceptosService();
