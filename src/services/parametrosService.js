const pool = require('./db');

class ParametrosService {
  
  // Obtener RMV vigente
  async obtenerRMV() {
    try {
      const [rows] = await pool.execute(`
        SELECT valor_numerico
        FROM parametros_sistema 
        WHERE codigo = 'RMV_PERU' 
          AND estado = 'ACTIVO'
          AND fecha_vigencia_desde <= CURDATE()
          AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURDATE())
        ORDER BY fecha_vigencia_desde DESC
        LIMIT 1
      `);
      
      if (rows.length === 0) {
        console.warn('[ParametrosService] No se encontró RMV vigente, usando valor de respaldo');
        return {
          success: true,
          valor: 1130.00,
          esRespaldo: true,
          mensaje: 'RMV de respaldo'
        };
      }
      
      return {
        success: true,
        valor: parseFloat(rows[0].valor_numerico),
        esRespaldo: false
      };
      
    } catch (error) {
      console.error('[ParametrosService] Error obteniendo RMV:', error);
      return {
        success: true,
        valor: 1130.00,
        esRespaldo: true,
        mensaje: 'RMV de respaldo'
      };
    }
  }
  
  // Obtener parámetro por código
  async obtenerParametroPorCodigo(codigo) {
    try {
      const [rows] = await pool.execute(`
        SELECT *
        FROM parametros_sistema 
        WHERE codigo = ? 
          AND estado = 'ACTIVO'
          AND fecha_vigencia_desde <= CURDATE()
          AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURDATE())
        ORDER BY fecha_vigencia_desde DESC
        LIMIT 1
      `, [codigo]);
      
      if (rows.length === 0) {
        return {
          success: false,
          message: `Parámetro ${codigo} no encontrado`
        };
      }
      
      const parametro = rows[0];
      
      return {
        success: true,
        parametro: {
          id: parametro.id_parametro,
          codigo: parametro.codigo,
          nombre: parametro.nombre,
          descripcion: parametro.descripcion,
          valor: parametro.tipo_parametro === 'NUMERICO' 
            ? parseFloat(parametro.valor_numerico) 
            : parametro.valor_texto,
          tipo: parametro.tipo_parametro,
          fechaVigencia: parametro.fecha_vigencia_desde
        }
      };
      
    } catch (error) {
      console.error('[ParametrosService] Error obteniendo parámetro:', error);
      return {
        success: false,
        message: 'Error obteniendo parámetro del sistema'
      };
    }
  }
  
  // Listar todos los parámetros activos
  async listarParametros() {
    try {
      const [rows] = await pool.execute(`
        SELECT *
        FROM parametros_sistema 
        WHERE estado = 'ACTIVO'
        ORDER BY codigo
      `);
      
      const parametros = rows.map(row => ({
        id: row.id_parametro,
        codigo: row.codigo,
        nombre: row.nombre,
        descripcion: row.descripcion,
        valor: row.tipo_parametro === 'NUMERICO' 
          ? parseFloat(row.valor_numerico) 
          : row.valor_texto,
        tipo: row.tipo_parametro,
        fechaVigencia: row.fecha_vigencia_desde,
        fechaVencimiento: row.fecha_vigencia_hasta
      }));
      
      return {
        success: true,
        parametros
      };
      
    } catch (error) {
      console.error('[ParametrosService] Error listando parámetros:', error);
      return {
        success: false,
        message: 'Error obteniendo parámetros del sistema'
      };
    }
  }
  
  // Actualizar parámetro
  async actualizarParametro(codigo, nuevoValor, fechaVigencia = null) {
    try {
      // Si no se especifica fecha de vigencia, usar la fecha actual
      const fechaVig = fechaVigencia || new Date().toISOString().split('T')[0];
      
      await pool.execute(`
        UPDATE parametros_sistema 
        SET valor_numerico = ?,
            fecha_vigencia_desde = ?,
            fecha_actualizacion = NOW()
        WHERE codigo = ? AND estado = 'ACTIVO'
      `, [nuevoValor, fechaVig, codigo]);
      
      return {
        success: true,
        message: `Parámetro ${codigo} actualizado exitosamente`
      };
      
    } catch (error) {
      console.error('[ParametrosService] Error actualizando parámetro:', error);
      return {
        success: false,
        message: 'Error actualizando parámetro del sistema'
      };
    }
  }
}

module.exports = new ParametrosService();
