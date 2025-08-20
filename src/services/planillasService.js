const pool = require('./db');

class PlanillasService {

  // Crear nueva planilla (inicialmente en estado 'borrador')
  async crearPlanilla(planillaData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        nombre,
        tipoPeriodo,
        mes,
        ano,
        fechaInicio,
        fechaFin,
        observaciones,
        trabajadoresSeleccionados
      } = planillaData;

      // Validar datos requeridos
      if (!nombre) throw new Error('Nombre de planilla es requerido');
      if (!tipoPeriodo) throw new Error('Tipo de período es requerido');
      if (!mes) throw new Error('Mes es requerido');
      if (!ano) throw new Error('Año es requerido');
      if (!fechaInicio) throw new Error('Fecha de inicio es requerida');
      if (!fechaFin) throw new Error('Fecha de fin es requerida');
      if (!trabajadoresSeleccionados || trabajadoresSeleccionados.length === 0) {
        throw new Error('Debe seleccionar al menos un trabajador');
      }

      console.log('[PlanillasService] Creando planilla con datos:', {
        nombre,
        tipoPeriodo,
        mes,
        ano,
        fechaInicio,
        fechaFin,
        observaciones: observaciones || 'null',
        trabajadores: trabajadoresSeleccionados.length
      });

      // 1. Insertar planilla principal
      const [result] = await connection.execute(`
        INSERT INTO planillas (
          nombre, 
          tipo_periodo, 
          mes, 
          ano, 
          fecha_inicio, 
          fecha_fin, 
          observaciones,
          total_trabajadores,
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'borrador')
      `, [
        nombre,
        tipoPeriodo,
        mes,
        ano,
        fechaInicio,
        fechaFin,
        observaciones || null,
        trabajadoresSeleccionados.length
      ]);

      const idPlanilla = result.insertId;

      // 2. Insertar trabajadores seleccionados (sin cálculos aún)
      for (const trabajador of trabajadoresSeleccionados) {
        console.log('[PlanillasService] Insertando trabajador:', {
          id: trabajador.id_trabajador,
          codigo: trabajador.codigo || 'NULL',
          nombres: trabajador.nombres || 'NULL',
          apellidos: trabajador.apellidos || 'NULL',
          area: trabajador.area || 'NULL',
          cargo: trabajador.cargo || 'NULL',
          sueldo: trabajador.sueldo || 0,
          sistema_pension: trabajador.id_sistema_pension || 'NULL'
        });

        // Validar que el trabajador tenga sistema de pensión
        if (!trabajador.id_sistema_pension) {
          throw new Error(`El trabajador ${trabajador.nombres} ${trabajador.apellidos} no tiene sistema de pensión asignado. Por favor, asigne un sistema de pensión antes de crear la planilla.`);
        }

        await connection.execute(`
          INSERT INTO planilla_trabajadores (
            id_planilla,
            id_trabajador,
            trabajador_codigo,
            trabajador_nombres,
            trabajador_apellidos,
            trabajador_area,
            trabajador_cargo,
            sueldo_basico,
            id_sistema_pension
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          idPlanilla,
          trabajador.id_trabajador,
          trabajador.codigo || null,
          trabajador.nombres || null,
          trabajador.apellidos || null,
          trabajador.area || null,
          trabajador.cargo || null,
          trabajador.sueldo || 0,
          trabajador.id_sistema_pension
        ]);
      }

      await connection.commit();

      console.log(`[PlanillasService] Planilla creada con ID: ${idPlanilla}`);

      return {
        success: true,
        id_planilla: idPlanilla,
        message: 'Planilla creada exitosamente'
      };

    } catch (error) {
      await connection.rollback();
      console.error('[PlanillasService] Error creando planilla:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  /**
 * Retorna todas las boletas de pago de los trabajadores de una planilla,
 * asegurando que los totales estén correctamente calculados.
 */
  async obtenerBoletasPorPlanilla(idPlanilla) {
    try {
      const [trabajadoresRows] = await pool.execute(`
      SELECT 
        pt.id_planilla_trabajador,
        pt.id_trabajador,
        pt.trabajador_nombres,
        pt.trabajador_apellidos,
        pt.trabajador_area,
        pt.trabajador_cargo,
        pt.sueldo_basico,
        pt.dias_laborados,
        pt.horas_extras_25,
        pt.horas_extras_35,
        pt.faltas,
        pt.total_ingresos,
        pt.total_descuentos,
        pt.total_aportes_trabajador,
        pt.total_aportes_empleador,
        pt.neto_a_pagar
      FROM planilla_trabajadores pt
      WHERE pt.id_planilla = ?
      ORDER BY pt.trabajador_apellidos, pt.trabajador_nombres
    `, [idPlanilla]);

      for (const trabajador of trabajadoresRows) {
        const [conceptosRows] = await pool.execute(`
        SELECT 
          concepto_nombre,
          concepto_tipo,
          monto_calculado
        FROM planilla_detalle_conceptos
        WHERE id_planilla_trabajador = ?
        ORDER BY concepto_tipo, concepto_nombre
      `, [trabajador.id_planilla_trabajador]);

        // Si no hay descuentos, aportes, etc. en conceptos, agrégalos manualmente
        if (parseFloat(trabajador.total_descuentos) > 0) {
          conceptosRows.push({
            concepto_nombre: 'Descuentos',
            concepto_tipo: 'descuento',
            monto_calculado: trabajador.total_descuentos
          });
        }
        if (parseFloat(trabajador.total_aportes_trabajador) > 0) {
          conceptosRows.push({
            concepto_nombre: 'Aportes Trabajador',
            concepto_tipo: 'aporte-trabajador',
            monto_calculado: trabajador.total_aportes_trabajador
          });
        }
        if (parseFloat(trabajador.total_aportes_empleador) > 0) {
          conceptosRows.push({
            concepto_nombre: 'Aportes Empleador',
            concepto_tipo: 'aporte-empleador',
            monto_calculado: trabajador.total_aportes_empleador
          });
        }

        trabajador.conceptos = conceptosRows;

        // Recalcula los totales como antes
        let ingresos = parseFloat(trabajador.sueldo_basico) || 0;
        let descuentos = 0, aportesTrabajador = 0, aportesEmpleador = 0, neto = 0;
        conceptosRows.forEach(c => {
          if (c.concepto_tipo === 'ingreso') ingresos += parseFloat(c.monto_calculado || 0);
          else if (c.concepto_tipo === 'descuento') descuentos += parseFloat(c.monto_calculado || 0);
          else if (c.concepto_tipo === 'aporte-trabajador' || c.concepto_tipo === 'aporte') aportesTrabajador += parseFloat(c.monto_calculado || 0);
          else if (c.concepto_tipo === 'aporte-empleador') aportesEmpleador += parseFloat(c.monto_calculado || 0);
        });
        neto = ingresos - descuentos - aportesTrabajador;

        trabajador.total_ingresos = ingresos;
        trabajador.total_descuentos = descuentos;
        trabajador.total_aportes_trabajador = aportesTrabajador;
        trabajador.total_aportes_empleador = aportesEmpleador;
        trabajador.neto_a_pagar = neto;
      }

      return {
        success: true,
        trabajadores: trabajadoresRows
      };
    } catch (error) {
      console.error('[PlanillasService] Error en obtenerBoletasPorPlanilla:', error);
      throw error;
    }
  }
  // Guardar cálculos de planilla (cambiar estado a 'calculada')
  async guardarCalculosPlanilla(idPlanilla, datosCalculados) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        trabajadores, // Array con datos calculados por trabajador
        totalesPlanilla
      } = datosCalculados;

      // 1. Actualizar totales de la planilla principal
      await connection.execute(`
        UPDATE planillas SET 
          estado = 'calculada',
          total_conceptos = ?,
          total_ingresos = ?,
          total_descuentos = ?,
          total_aportes_trabajador = ?,
          total_aportes_empleador = ?,
          total_neto_pagar = ?,
          fecha_calculo = NOW(),
          fecha_actualizacion = NOW()
        WHERE id_planilla = ?
      `, [
        totalesPlanilla.totalConceptos || 0,
        totalesPlanilla.totalIngresos || 0,
        totalesPlanilla.totalDescuentos || 0,
        totalesPlanilla.totalAportesTrabajador || 0,
        totalesPlanilla.totalAportesEmpleador || 0,
        totalesPlanilla.totalNeto || 0,
        idPlanilla
      ]);

      // 2. Actualizar cada trabajador con sus cálculos
      for (const trabajador of trabajadores) {
        // Actualizar totales del trabajador
        await connection.execute(`
          UPDATE planilla_trabajadores SET
            dias_laborados = ?,
            horas_extras_25 = ?,
            horas_extras_35 = ?,
            faltas = ?,
            total_ingresos = ?,
            total_descuentos = ?,
            total_aportes_trabajador = ?,
            total_aportes_empleador = ?,
            neto_a_pagar = ?,
            fecha_calculo = NOW()
          WHERE id_planilla = ? AND id_trabajador = ?
        `, [
          trabajador.diasLaborados || 30,
          trabajador.horasExtras25 || 0,
          trabajador.horasExtras35 || 0,
          trabajador.faltas || 0,
          trabajador.totalIngresos || 0,
          trabajador.totalDescuentos || 0,
          trabajador.totalAportesTrabajador || 0,
          trabajador.totalAportesEmpleador || 0,
          trabajador.netoAPagar || 0,
          idPlanilla,
          trabajador.idTrabajador
        ]);

        // Obtener ID del registro planilla_trabajadores
        const [planillaTrabajadorResult] = await connection.execute(
          'SELECT id_planilla_trabajador FROM planilla_trabajadores WHERE id_planilla = ? AND id_trabajador = ?',
          [idPlanilla, trabajador.idTrabajador]
        );

        const idPlanillaTrabajador = planillaTrabajadorResult[0].id_planilla_trabajador;

        // 3. Guardar detalle de cada concepto calculado
        for (const concepto of trabajador.conceptos) {
          await connection.execute(`
    INSERT INTO planilla_detalle_conceptos (
      id_planilla_trabajador,
      id_concepto,
      concepto_codigo,
      concepto_nombre,
      concepto_tipo,
      tipo_calculo,
      valor_original,
      base_calculo,
      monto_calculado,
      formula_aplicada,
      origen_calculo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'automatico')
  `, [
            idPlanillaTrabajador,
            concepto.idConcepto || null,
            concepto.codigo || null,
            concepto.nombre || '',
            concepto.tipo || '',
            concepto.tipoCalculo || '',
            concepto.valorOriginal || 0,
            concepto.baseCalculo || null,
            concepto.montoCalculado || 0,
            concepto.formulaAplicada || null
          ]);
        
        // Nota: Los aportes (ONP, AFP, ESSALUD) se calculan automáticamente
        // y sus totales ya están incluidos en planilla_trabajadores
      }
    }

      await connection.commit();

    console.log(`[PlanillasService] Cálculos guardados para planilla ${idPlanilla}`);

    return {
      success: true,
      message: 'Cálculos de planilla guardados exitosamente'
    };

  } catch(error) {
    await connection.rollback();
    console.error('[PlanillasService] Error guardando cálculos:', error);
    throw error;
  } finally {
    connection.release();
  }
  }

  // Listar todas las planillas
  async listarPlanillas(filtros = {}) {
  try {
    const { estado, ano, busqueda } = filtros;

    let query = `
        SELECT 
          id_planilla,
          nombre,
          tipo_periodo,
          mes,
          ano,
          fecha_inicio,
          fecha_fin,
          estado,
          total_trabajadores,
          total_neto_pagar,
          fecha_creacion,
          fecha_calculo
        FROM planillas
        WHERE 1=1
      `;

    const params = [];

    // Aplicar filtros
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    if (ano) {
      query += ' AND ano = ?';
      params.push(ano);
    }

    if (busqueda) {
      query += ' AND nombre LIKE ?';
      params.push(`%${busqueda}%`);
    }

    query += ' ORDER BY fecha_creacion DESC';

    const [rows] = await pool.execute(query, params);

    // Formatear datos para el frontend
    const planillas = rows.map(planilla => ({
      id: planilla.id_planilla,
      nombre: planilla.nombre,
      periodo: `${this.getNombreMes(planilla.mes)}/${planilla.ano}`,
      tipo: planilla.tipo_periodo === 'mensual' ? 'Mensual' : 'Quincenal',
      totalNeto: planilla.total_neto_pagar || 0,
      estado: planilla.estado,
      totalTrabajadores: planilla.total_trabajadores || 0,
      fechaCreacion: planilla.fecha_creacion,
      fechaCalculo: planilla.fecha_calculo
    }));

    return {
      success: true,
      planillas
    };

  } catch (error) {
    console.error('[PlanillasService] Error listando planillas:', error);
    throw error;
  }
}

  // Obtener estadísticas para las tarjetas
  async obtenerEstadisticas() {
  try {
    // Planillas activas (estado != 'pagada')
    const [activasResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM planillas 
        WHERE estado != 'pagada'
      `);

    // Total pagado en el año actual
    const [pagadoResult] = await pool.execute(`
        SELECT COALESCE(SUM(total_neto_pagar), 0) as total 
        FROM planillas 
        WHERE estado = 'pagada' AND ano = YEAR(NOW())
      `);

    // Total trabajadores activos
    const [trabajadoresResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM trabajadores 
        WHERE estado = 'ACTIVO'
      `);

    // Total de planillas
    const [totalPlanillasResult] = await pool.execute(`
        SELECT COUNT(*) as total FROM planillas
      `);

    return {
      success: true,
      estadisticas: {
        planillasActivas: activasResult[0].total,
        totalPagado: pagadoResult[0].total,
        totalTrabajadores: trabajadoresResult[0].total,
        totalPlanillas: totalPlanillasResult[0].total
      }
    };

  } catch (error) {
    console.error('[PlanillasService] Error obteniendo estadísticas:', error);
    throw error;
  }
}

  // Obtener detalle completo de una planilla
  async obtenerDetallePlanilla(idPlanilla) {
  try {
    // Datos de la planilla principal
    const [planillaRows] = await pool.execute(`
        SELECT * FROM planillas WHERE id_planilla = ?
      `, [idPlanilla]);

    if (planillaRows.length === 0) {
      throw new Error('Planilla no encontrada');
    }

    const planilla = planillaRows[0];

    // Trabajadores de la planilla
    const [trabajadoresRows] = await pool.execute(`
        SELECT * FROM planilla_trabajadores 
        WHERE id_planilla = ?
        ORDER BY trabajador_apellidos, trabajador_nombres
      `, [idPlanilla]);

    // Para cada trabajador, obtener sus conceptos
    for (const trabajador of trabajadoresRows) {
      const [conceptosRows] = await pool.execute(`
          SELECT * FROM planilla_detalle_conceptos
          WHERE id_planilla_trabajador = ?
          ORDER BY concepto_tipo, concepto_nombre
        `, [trabajador.id_planilla_trabajador]);

      trabajador.conceptos = conceptosRows;
    }

    return {
      success: true,
      planilla: {
        ...planilla,
        trabajadores: trabajadoresRows
      }
    };

  } catch (error) {
    console.error('[PlanillasService] Error obteniendo detalle:', error);
    throw error;
  }
}

  // Actualizar estado de planilla
  async actualizarEstadoPlanilla(idPlanilla, nuevoEstado) {
  try {
    await pool.execute(`
        UPDATE planillas 
        SET estado = ?, fecha_actualizacion = NOW()
        WHERE id_planilla = ?
      `, [nuevoEstado, idPlanilla]);

    return {
      success: true,
      message: `Estado actualizado a ${nuevoEstado}`
    };

  } catch (error) {
    console.error('[PlanillasService] Error actualizando estado:', error);
    throw error;
  }
}

// Método auxiliar para obtener nombre del mes
getNombreMes(numeroMes) {
  const meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[numeroMes] || 'Mes';
}
}


module.exports = new PlanillasService();
