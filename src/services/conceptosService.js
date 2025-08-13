const pool = require('./db');

class ConceptosService {
  
  // Crear nuevo concepto
  async crearConcepto(conceptoData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        codigo,
        nombre,
        tipo,
        tipoCalculo,
        valor,
        codigoContable,
        esRemunerativo,
        activo,
        fechaInicio,
        fechaFin
      } = conceptoData;
      
      // Verificar si el código ya existe
      const [existingConcept] = await connection.execute(
        'SELECT id_concepto FROM conceptos WHERE codigo = ?',
        [codigo]
      );
      
      if (existingConcept.length > 0) {
        throw new Error(`El código '${codigo}' ya existe`);
      }
      
      // Insertar nuevo concepto
      const [result] = await connection.execute(`
        INSERT INTO conceptos (
          codigo, 
          nombre, 
          tipo, 
          tipo_calculo, 
          valor, 
          codigo_contable, 
          es_remunerativo, 
          activo, 
          fecha_inicio, 
          fecha_fin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        codigo || null,
        nombre || null,
        tipo || null,
        tipoCalculo || null,
        parseFloat(valor) || 0,
        codigoContable || null,
        esRemunerativo ? 1 : 0,
        activo !== false ? 1 : 0,
        fechaInicio || null,
        fechaFin || null
      ]);
      
      await connection.commit();
      
      console.log('Concepto creado exitosamente:', {
        id: result.insertId,
        codigo,
        nombre
      });
      
      return {
        success: true,
        id_concepto: result.insertId,
        message: 'Concepto creado exitosamente'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al crear concepto:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Obtener todos los conceptos
  async obtenerConceptos(filtros = {}) {
    try {
      let query = `
        SELECT 
          id_concepto,
          codigo,
          nombre,
          tipo,
          tipo_calculo,
          valor,
          codigo_contable,
          es_remunerativo,
          activo,
          fecha_inicio,
          fecha_fin,
          fecha_creacion,
          fecha_actualizacion
        FROM conceptos
      `;
      
      const params = [];
      const conditions = [];
      
      // Filtros opcionales
      if (filtros.tipo && filtros.tipo !== 'todos') {
        conditions.push('tipo = ?');
        params.push(filtros.tipo);
      }
      
      if (filtros.activo !== undefined) {
        conditions.push('activo = ?');
        params.push(filtros.activo ? 1 : 0);
      }
      
      if (filtros.busqueda) {
        conditions.push('(nombre LIKE ? OR codigo LIKE ?)');
        const searchTerm = `%${filtros.busqueda}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY tipo, codigo';
      
      const [conceptos] = await pool.execute(query, params);
      
      // Transformar los datos para el frontend
      const conceptosTransformados = conceptos.map(concepto => ({
        ...concepto,
        es_remunerativo: Boolean(concepto.es_remunerativo),
        activo: Boolean(concepto.activo),
        tipo_display: this.getTipoDisplay(concepto.tipo),
        tipo_calculo_display: this.getTipoCalculoDisplay(concepto.tipo_calculo),
        valor_display: concepto.tipo_calculo === 'porcentaje' ? 
          `${concepto.valor}%` : 
          `S/. ${parseFloat(concepto.valor).toFixed(2)}`
      }));
      
      return conceptosTransformados;
      
    } catch (error) {
      console.error('Error al obtener conceptos:', error);
      throw error;
    }
  }
  
  // Obtener concepto por ID
  async obtenerConceptoPorId(idConcepto) {
    try {
      const [result] = await pool.execute(`
        SELECT 
          id_concepto,
          codigo,
          nombre,
          tipo,
          tipo_calculo,
          valor,
          codigo_contable,
          es_remunerativo,
          activo,
          fecha_inicio,
          fecha_fin,
          fecha_creacion,
          fecha_actualizacion
        FROM conceptos 
        WHERE id_concepto = ?
      `, [idConcepto]);
      
      if (result.length === 0) {
        throw new Error('Concepto no encontrado');
      }
      
      const concepto = result[0];
      
      return {
        ...concepto,
        es_remunerativo: Boolean(concepto.es_remunerativo),
        activo: Boolean(concepto.activo)
      };
      
    } catch (error) {
      console.error('Error al obtener concepto por ID:', error);
      throw error;
    }
  }
  
  // Actualizar concepto existente
  async actualizarConcepto(idConcepto, conceptoData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        codigo,
        nombre,
        tipo,
        tipoCalculo,
        valor,
        codigoContable,
        esRemunerativo,
        activo,
        fechaInicio,
        fechaFin
      } = conceptoData;
      
      // Verificar que el concepto existe
      const [conceptoExistente] = await connection.execute(
        'SELECT id_concepto FROM conceptos WHERE id_concepto = ?',
        [idConcepto]
      );
      
      if (conceptoExistente.length === 0) {
        throw new Error('Concepto no encontrado');
      }
      
      // Verificar si el código ya existe en otro concepto
      if (codigo) {
        const [codigoExistente] = await connection.execute(
          'SELECT id_concepto FROM conceptos WHERE codigo = ? AND id_concepto != ?',
          [codigo, idConcepto]
        );
        
        if (codigoExistente.length > 0) {
          throw new Error(`El código '${codigo}' ya existe en otro concepto`);
        }
      }
      
      // Actualizar concepto
      await connection.execute(`
        UPDATE conceptos SET
          codigo = ?,
          nombre = ?,
          tipo = ?,
          tipo_calculo = ?,
          valor = ?,
          codigo_contable = ?,
          es_remunerativo = ?,
          activo = ?,
          fecha_inicio = ?,
          fecha_fin = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_concepto = ?
      `, [
        codigo || null,
        nombre || null,
        tipo || null,
        tipoCalculo || null,
        parseFloat(valor) || 0,
        codigoContable || null,
        esRemunerativo ? 1 : 0,
        activo !== false ? 1 : 0,
        fechaInicio || null,
        fechaFin || null,
        idConcepto
      ]);
      
      await connection.commit();
      
      // Obtener el concepto actualizado
      const conceptoActualizado = await this.obtenerConceptoPorId(idConcepto);
      
      return {
        success: true,
        message: 'Concepto actualizado exitosamente',
        concepto: conceptoActualizado
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al actualizar concepto:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Obtener estadísticas de conceptos por tipo
  async obtenerEstadisticas() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          tipo,
          COUNT(*) as total,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos
        FROM conceptos
        GROUP BY tipo
        ORDER BY tipo
      `);
      
      const estadisticas = {
        total: 0,
        activos: 0,
        por_tipo: {
          'ingreso': { total: 0, activos: 0 },
          'descuento': { total: 0, activos: 0 },
          'aporte-trabajador': { total: 0, activos: 0 },
          'aporte-empleador': { total: 0, activos: 0 }
        }
      };
      
      stats.forEach(stat => {
        estadisticas.total += stat.total;
        estadisticas.activos += stat.activos;
        estadisticas.por_tipo[stat.tipo] = {
          total: stat.total,
          activos: stat.activos
        };
      });
      
      return estadisticas;
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares para display
  getTipoDisplay(tipo) {
    const tipos = {
      'ingreso': 'Ingreso',
      'descuento': 'Descuento',
      'aporte-trabajador': 'Aporte Trabajador',
      'aporte-empleador': 'Aporte Empleador'
    };
    return tipos[tipo] || tipo;
  }
  
  getTipoCalculoDisplay(tipoCalculo) {
    const tipos = {
      'monto-fijo': 'Monto Fijo',
      'porcentaje': 'Porcentaje'
    };
    return tipos[tipoCalculo] || tipoCalculo;
  }
}

module.exports = new ConceptosService();
