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
  
  // Obtener conceptos de un trabajador con filtro opcional por tipo
  async obtenerConceptosPorTrabajador(idTrabajador, tipoConcepto = null) {
    try {
      console.log(`[TrabajadorConceptosService] Obteniendo conceptos del trabajador ${idTrabajador}, tipo: ${tipoConcepto || 'todos'}`);
      
      let query = `
        SELECT 
          c.id_concepto,
          c.codigo,
          c.nombre,
          c.tipo,
          c.tipo_calculo,
          c.valor,
          c.codigo_contable,
          c.es_remunerativo,
          tc.fecha_asignacion,
          tc.activo as concepto_activo
        FROM trabajador_conceptos tc
        INNER JOIN conceptos c ON tc.id_concepto = c.id_concepto
        WHERE tc.id_trabajador = ? 
          AND tc.activo = 1 
          AND c.activo = 1
      `;
      
      const params = [idTrabajador];
      
      // Filtrar por tipo si se especifica
      if (tipoConcepto) {
        query += ' AND c.tipo = ?';
        params.push(tipoConcepto);
      }
      
      query += ' ORDER BY c.tipo, c.nombre';
      
      console.log(`[TrabajadorConceptosService] Query: ${query}`);
      console.log(`[TrabajadorConceptosService] Params:`, params);
      
      const [rows] = await db.execute(query, params);
      
      console.log(`[TrabajadorConceptosService] Conceptos encontrados: ${rows.length}`);
      
      return {
        success: true,
        conceptos: rows
      };
    } catch (error) {
      console.error('[TrabajadorConceptosService] Error obteniendo conceptos por trabajador:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener aportes del trabajador con cálculos automáticos
  async obtenerAportesTrabajador(idTrabajador) {
    try {
      console.log(`[TrabajadorConceptosService] Calculando aportes del trabajador ${idTrabajador}`);
      
      // 1. Obtener datos del trabajador y su sistema de pensión
      const queryTrabajador = `
        SELECT 
          t.id_trabajador,
          t.nombres,
          t.apellidos,
          t.sueldo,
          t.id_sistema_pension,
          sp.nombre as sistema_pension,
          sp.tipo as tipo_pension
        FROM trabajadores t
        INNER JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
        WHERE t.id_trabajador = ? AND t.estado = 'ACTIVO'
      `;
      
      const [trabajadorRows] = await db.execute(queryTrabajador, [idTrabajador]);
      
      if (trabajadorRows.length === 0) {
        return { success: false, error: 'Trabajador no encontrado' };
      }
      
      const trabajador = trabajadorRows[0];
      
      // 2. Obtener conceptos de ingresos remunerativos del trabajador
      const queryIngresosRemunerativos = `
        SELECT 
          c.id_concepto,
          c.nombre,
          c.tipo_calculo,
          c.valor,
          c.es_remunerativo
        FROM trabajador_conceptos tc
        INNER JOIN conceptos c ON tc.id_concepto = c.id_concepto
        WHERE tc.id_trabajador = ? 
          AND tc.activo = 1 
          AND c.activo = 1
          AND c.tipo = 'ingreso'
          AND c.es_remunerativo = 1
        ORDER BY c.nombre
      `;
      
      const [conceptosRows] = await db.execute(queryIngresosRemunerativos, [idTrabajador]);
      
      // 3. Calcular total de ingresos remunerativos
      let totalRemunerativo = parseFloat(trabajador.sueldo); // Sueldo básico siempre es remunerativo
      
      // Sumar conceptos remunerativos
      conceptosRows.forEach(concepto => {
        if (concepto.tipo_calculo === 'monto-fijo') {
          totalRemunerativo += parseFloat(concepto.valor);
        } else if (concepto.tipo_calculo === 'porcentaje') {
          totalRemunerativo += (parseFloat(trabajador.sueldo) * parseFloat(concepto.valor)) / 100;
        }
      });
      
      console.log(`[TrabajadorConceptosService] Total remunerativo calculado: ${totalRemunerativo}`);
      
      // 4. Obtener detalles del sistema de pensión y calcular aportes
      let aportes = [];
      
      if (trabajador.tipo_pension === 'ONP') {
        // Consultar detalle ONP
        const queryONP = `
          SELECT porcentaje 
          FROM detalle_onp 
          WHERE id_sistema_pension = ?
        `;
        
        const [onpRows] = await db.execute(queryONP, [trabajador.id_sistema_pension]);
        
        if (onpRows.length > 0) {
          const porcentajeONP = parseFloat(onpRows[0].porcentaje);
          const montoONP = (totalRemunerativo * porcentajeONP) / 100;
          
          aportes.push({
            concepto: 'ONP',
            porcentaje: porcentajeONP,
            monto: montoONP,
            base_calculo: totalRemunerativo
          });
        }
      } else if (trabajador.tipo_pension === 'AFP') {
        // Consultar detalle AFP
        const queryAFP = `
          SELECT fondo, comision, tipo_comision, seguro
          FROM detalle_afp 
          WHERE id_sistema_pension = ?
        `;
        
        const [afpRows] = await db.execute(queryAFP, [trabajador.id_sistema_pension]);
        
        if (afpRows.length > 0) {
          const detalleAFP = afpRows[0];
          
          // AFP - Fondo (con nombre específico del sistema)
          const montoFondo = (totalRemunerativo * parseFloat(detalleAFP.fondo)) / 100;
          aportes.push({
            concepto: `${trabajador.sistema_pension} - Fondo`,
            porcentaje: parseFloat(detalleAFP.fondo),
            monto: montoFondo,
            base_calculo: totalRemunerativo
          });
          
          // AFP - Comisión (con nombre específico del sistema)
          const montoComision = (totalRemunerativo * parseFloat(detalleAFP.comision)) / 100;
          aportes.push({
            concepto: `${trabajador.sistema_pension} - Comisión (${detalleAFP.tipo_comision})`,
            porcentaje: parseFloat(detalleAFP.comision),
            monto: montoComision,
            base_calculo: totalRemunerativo
          });
          
          // AFP - Seguro (con nombre específico del sistema)
          const montoSeguro = (totalRemunerativo * parseFloat(detalleAFP.seguro)) / 100;
          aportes.push({
            concepto: `${trabajador.sistema_pension} - Seguro`,
            porcentaje: parseFloat(detalleAFP.seguro),
            monto: montoSeguro,
            base_calculo: totalRemunerativo
          });
        }
      }
      
      console.log(`[TrabajadorConceptosService] Aportes calculados:`, aportes);
      
      return {
        success: true,
        trabajador: {
          id: trabajador.id_trabajador,
          nombres: trabajador.nombres,
          apellidos: trabajador.apellidos,
          sistema_pension: trabajador.sistema_pension,
          tipo_pension: trabajador.tipo_pension
        },
        total_remunerativo: totalRemunerativo,
        conceptos_remunerativos: conceptosRows,
        aportes: aportes
      };
    } catch (error) {
      console.error('[TrabajadorConceptosService] Error obteniendo aportes del trabajador:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TrabajadorConceptosService();
