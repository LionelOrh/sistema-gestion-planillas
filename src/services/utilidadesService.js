const pool = require('./db');

/**
 * Obtener trabajadores para el cálculo de utilidades
 */
async function obtenerTrabajadoresParaUtilidades() {
  try {
    console.log('Ejecutando consulta SQL para obtener trabajadores para utilidades...');
    const [rows] = await pool.query(`
      SELECT 
        t.id_trabajador,
        t.codigo,
        t.nombres,
        t.apellidos,
        t.area,
        t.cargo,
        t.sueldo,
        t.fecha_ingreso,
        t.fecha_cese,
        t.estado,
        sp.nombre as sistema_pension_nombre,
        sp.tipo as sistema_pension_tipo
      FROM trabajadores t
      LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
      ORDER BY t.nombres ASC, t.apellidos ASC
    `);
    
    console.log(`Se obtuvieron ${rows.length} trabajadores para cálculo de utilidades`);
    return rows;
  } catch (err) {
    console.error('Error al obtener trabajadores para utilidades:', err);
    throw err;
  }
}

/**
 * Obtener trabajadores elegibles para utilidades en un año específico
 */
async function obtenerTrabajadoresElegibles(año) {
  try {
    console.log(`Obteniendo trabajadores elegibles para utilidades del año ${año}...`);
    
    const fechaInicio = `${año}-01-01`;
    const fechaFin = `${año}-12-31`;
    
    const [rows] = await pool.query(`
      SELECT 
        t.id_trabajador,
        t.codigo,
        t.nombres,
        t.apellidos,
        t.area,
        t.cargo,
        t.sueldo,
        t.fecha_ingreso,
        t.fecha_cese,
        t.estado,
        sp.nombre as sistema_pension_nombre,
        sp.tipo as sistema_pension_tipo
      FROM trabajadores t
      LEFT JOIN sistema_pension sp ON t.id_sistema_pension = sp.id_sistema_pension
      WHERE (
        -- Trabajador debe haber ingresado antes o durante el año
        t.fecha_ingreso <= ?
        AND (
          -- Y debe estar activo o haber cesado después del inicio del año
          t.estado = 'activo' 
          OR (t.estado = 'inactivo' AND t.fecha_cese >= ?)
        )
      )
      ORDER BY t.nombres ASC, t.apellidos ASC
    `, [fechaFin, fechaInicio]);
    
    console.log(`Se encontraron ${rows.length} trabajadores elegibles para utilidades ${año}`);
    return rows;
  } catch (err) {
    console.error('Error al obtener trabajadores elegibles:', err);
    throw err;
  }
}

/**
 * Calcular días laborados de un trabajador en un período específico
 */
function calcularDiasLaborados(trabajador, año) {
  try {
    const fechaInicio = new Date(año, 0, 1); // 1 enero
    const fechaFin = new Date(año, 11, 31); // 31 diciembre

    // Fecha de ingreso efectiva
    let inicioEfectivo = fechaInicio;
    if (trabajador.fecha_ingreso) {
      const fechaIngreso = new Date(trabajador.fecha_ingreso);
      if (fechaIngreso > fechaInicio) {
        inicioEfectivo = fechaIngreso;
      }
    }

    // Fecha de cese efectiva
    let finEfectivo = fechaFin;
    if (trabajador.fecha_cese && trabajador.estado === 'inactivo') {
      const fechaCese = new Date(trabajador.fecha_cese);
      if (fechaCese < fechaFin) {
        finEfectivo = fechaCese;
      }
    }

    // Calcular días laborados
    const diffTime = finEfectivo - inicioEfectivo;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error al calcular días laborados:', error);
    return 0;
  }
}

/**
 * Calcular sueldo anual proporcional de un trabajador
 */
function calcularSueldoAnual(trabajador, año) {
  try {
    const diasLaborados = calcularDiasLaborados(trabajador, año);
    const sueldoDiario = trabajador.sueldo / 30; // Asumiendo mes de 30 días
    return sueldoDiario * diasLaborados;
  } catch (error) {
    console.error('Error al calcular sueldo anual:', error);
    return 0;
  }
}

/**
 * Realizar cálculo completo de utilidades
 */
async function calcularUtilidades(parametros) {
  try {
    const { empresa, año, montorenta, porcentaje } = parametros;
    
    console.log('Calculando utilidades con parámetros:', parametros);
    
    // Obtener trabajadores elegibles
    const trabajadoresElegibles = await obtenerTrabajadoresElegibles(año);
    
    if (trabajadoresElegibles.length === 0) {
      throw new Error(`No se encontraron trabajadores elegibles para el año ${año}`);
    }

    const montoTotal = montorenta * (porcentaje / 100);
    const montoPorDias = montoTotal * 0.5;
    const montoPorSueldos = montoTotal * 0.5;

    let totalDiasLaborados = 0;
    let totalSueldosAnuales = 0;

    // Calcular totales para proporciones
    const trabajadoresConCalculos = trabajadoresElegibles.map(trabajador => {
      const diasLaborados = calcularDiasLaborados(trabajador, año);
      const sueldoAnual = calcularSueldoAnual(trabajador, año);

      totalDiasLaborados += diasLaborados;
      totalSueldosAnuales += sueldoAnual;

      return {
        ...trabajador,
        diasLaborados,
        sueldoAnual
      };
    });

    // Calcular distribución individual
    const distribuciones = trabajadoresConCalculos.map(trabajador => {
      // Proporción por días
      const proporcionDias = totalDiasLaborados > 0 ? trabajador.diasLaborados / totalDiasLaborados : 0;
      const montoPorDiasIndividual = montoPorDias * proporcionDias;

      // Proporción por sueldo
      const proporcionSueldo = totalSueldosAnuales > 0 ? trabajador.sueldoAnual / totalSueldosAnuales : 0;
      const montoPorSueldoIndividual = montoPorSueldos * proporcionSueldo;

      // Total antes del tope
      const totalSinTope = montoPorDiasIndividual + montoPorSueldoIndividual;

      // Aplicar tope de 18 sueldos
      const topeSueldos = trabajador.sueldo * 18;
      const montoFinal = Math.min(totalSinTope, topeSueldos);
      const topeAplicado = totalSinTope > topeSueldos;

      return {
        id_trabajador: trabajador.id_trabajador,
        codigo: trabajador.codigo,
        nombres: trabajador.nombres,
        apellidos: trabajador.apellidos,
        cargo: trabajador.cargo || 'No especificado',
        area: trabajador.area || 'No especificado',
        sueldo: parseFloat(trabajador.sueldo),
        diasLaborados: trabajador.diasLaborados,
        sueldoAnual: trabajador.sueldoAnual,
        montoPorDias: montoPorDiasIndividual,
        montoPorSueldo: montoPorSueldoIndividual,
        totalSinTope,
        topeSueldos,
        montoFinal,
        topeAplicado,
        proporcionDias,
        proporcionSueldo
      };
    });

    // Calcular totales finales
    const totalDistribuido = distribuciones.reduce((sum, d) => sum + d.montoFinal, 0);
    const diferencia = montoTotal - totalDistribuido;

    const totales = {
      montoTotal,
      montoPorDias,
      montoPorSueldos,
      totalDistribuido,
      diferencia,
      trabajadoresElegibles: distribuciones.length,
      trabajadoresConTope: distribuciones.filter(d => d.topeAplicado).length,
      totalDiasLaborados,
      totalSueldosAnuales
    };

    const resultado = {
      parametros,
      totales,
      distribuciones,
      fechaCalculo: new Date()
    };

    console.log('Cálculo de utilidades completado:', {
      trabajadores: distribuciones.length,
      montoTotal,
      totalDistribuido,
      diferencia
    });

    return resultado;

  } catch (error) {
    console.error('Error en cálculo de utilidades:', error);
    throw error;
  }
}

/**
 * Obtener resumen de utilidades por área
 */
function obtenerResumenPorArea(distribuciones) {
  try {
    const resumenAreas = {};

    distribuciones.forEach(distribucion => {
      const area = distribucion.area || 'Sin área';
      
      if (!resumenAreas[area]) {
        resumenAreas[area] = {
          area,
          trabajadores: 0,
          montoTotal: 0,
          trabajadoresConTope: 0,
          diasTotales: 0
        };
      }

      resumenAreas[area].trabajadores++;
      resumenAreas[area].montoTotal += distribucion.montoFinal;
      resumenAreas[area].diasTotales += distribucion.diasLaborados;
      
      if (distribucion.topeAplicado) {
        resumenAreas[area].trabajadoresConTope++;
      }
    });

    return Object.values(resumenAreas).sort((a, b) => b.montoTotal - a.montoTotal);
  } catch (error) {
    console.error('Error al obtener resumen por área:', error);
    return [];
  }
}

/**
 * Validar parámetros de cálculo
 */
function validarParametrosCalculo(parametros) {
  const errores = [];

  if (!parametros.empresa || typeof parametros.empresa !== 'string') {
    errores.push('La empresa es requerida');
  }

  if (!parametros.año || !Number.isInteger(parametros.año) || parametros.año < 2000 || parametros.año > new Date().getFullYear()) {
    errores.push('El año debe ser un número entero válido entre 2000 y el año actual');
  }

  if (!parametros.montorenta || typeof parametros.montorenta !== 'number' || parametros.montorenta <= 0) {
    errores.push('El monto de renta debe ser un número mayor a 0');
  }

  if (!parametros.porcentaje || typeof parametros.porcentaje !== 'number' || parametros.porcentaje <= 0 || parametros.porcentaje > 100) {
    errores.push('El porcentaje debe ser un número entre 1 y 100');
  }

  return errores;
}

/**
 * Formatear datos para exportación
 */
function formatearParaExportacion(calculoUtilidades) {
  try {
    const { parametros, totales, distribuciones, fechaCalculo } = calculoUtilidades;

    const datosFormateados = {
      informacion: {
        empresa: parametros.empresa,
        año: parametros.año,
        fechaCalculo: fechaCalculo.toLocaleDateString('es-PE'),
        horaCalculo: fechaCalculo.toLocaleTimeString('es-PE')
      },
      parametros: {
        montorenta: parametros.montorenta,
        porcentaje: parametros.porcentaje,
        montoTotal: totales.montoTotal,
        montoPorDias: totales.montoPorDias,
        montoPorSueldos: totales.montoPorSueldos
      },
      resumen: {
        trabajadoresElegibles: totales.trabajadoresElegibles,
        trabajadoresConTope: totales.trabajadoresConTope,
        totalDistribuido: totales.totalDistribuido,
        diferencia: totales.diferencia,
        totalDiasLaborados: totales.totalDiasLaborados
      },
      distribuciones: distribuciones.map((d, index) => ({
        nro: index + 1,
        codigo: d.codigo,
        trabajador: `${d.nombres} ${d.apellidos}`,
        area: d.area,
        cargo: d.cargo,
        sueldo: d.sueldo,
        diasLaborados: d.diasLaborados,
        sueldoAnual: d.sueldoAnual,
        montoPorDias: d.montoPorDias,
        montoPorSueldo: d.montoPorSueldo,
        totalSinTope: d.totalSinTope,
        topeAplicado: d.topeAplicado ? 'Sí' : 'No',
        montoFinal: d.montoFinal
      })),
      resumenAreas: obtenerResumenPorArea(distribuciones)
    };

    return datosFormateados;
  } catch (error) {
    console.error('Error al formatear datos para exportación:', error);
    throw error;
  }
}

module.exports = {
  obtenerTrabajadoresParaUtilidades,
  obtenerTrabajadoresElegibles,
  calcularUtilidades,
  calcularDiasLaborados,
  calcularSueldoAnual,
  obtenerResumenPorArea,
  validarParametrosCalculo,
  formatearParaExportacion
};
