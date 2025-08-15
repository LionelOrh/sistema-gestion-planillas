const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { login } = require('../services/loginService');
const { obtenerTrabajadores, obtenerTrabajadorPorId, crearTrabajador, actualizarTrabajador, obtenerTrabajadoresParaPlanilla, obtenerTrabajadoresPorArea } = require('../services/trabajadoresService');
const { obtenerSistemasPension, obtenerSistemaPorId, crearSistemaPension, actualizarSistemaPension, eliminarSistemaPension } = require('../services/sistemaPensionesService');
const conceptosService = require('../services/conceptosService');
const trabajadorConceptosService = require('../services/trabajadorConceptosService');
const planillasService = require('../services/planillasService');
const parametrosService = require('../services/parametrosService');

let loginWindow = null;
let dashboardWindow = null;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  loginWindow.loadFile(path.join(__dirname, '../renderer/login/login.html'));
  loginWindow.on('closed', () => { loginWindow = null; });
}

function createDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    minimizable: true,
    frame: true, // muestra los controles nativos de la ventana
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  dashboardWindow.maximize(); // abre maximizada pero no en fullscreen
  dashboardWindow.loadFile(path.join(__dirname, '../renderer/dashboard/dashboard.html'));
  dashboardWindow.on('closed', () => { dashboardWindow = null; });
}

app.whenReady().then(() => {
  createLoginWindow();

  ipcMain.handle('login', async (event, usuario, clave) => {
    const result = await login(usuario, clave);
    if (result) {
      createDashboardWindow();
      if (loginWindow) loginWindow.close();
    }
    return result;
  });

  // IPC handler para trabajadores
  ipcMain.handle('obtener-trabajadores', async () => {
    console.log('Handler obtener-trabajadores llamado');
    try {
      const result = await obtenerTrabajadores();
      console.log('Datos obtenidos en handler:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-trabajadores:', error);
      throw error;
    }
  });

  // IPC handler para crear trabajador
  ipcMain.handle('crear-trabajador', async (event, datosFormulario) => {
    console.log('Handler crear-trabajador llamado con datos:', datosFormulario);
    try {
      const result = await crearTrabajador(datosFormulario);
      console.log('Trabajador creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler crear-trabajador:', error);
      throw error;
    }
  });

  // IPC handler para obtener trabajador por ID
  ipcMain.handle('obtener-trabajador-por-id', async (event, id) => {
    console.log('Handler obtener-trabajador-por-id llamado para ID:', id);
    try {
      const result = await obtenerTrabajadorPorId(id);
      console.log('Trabajador obtenido:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-trabajador-por-id:', error);
      throw error;
    }
  });

  // IPC handler para actualizar trabajador
  ipcMain.handle('actualizar-trabajador', async (event, id, datosFormulario) => {
    console.log('Handler actualizar-trabajador llamado para ID:', id);
    try {
      const result = await actualizarTrabajador(id, datosFormulario);
      console.log('Trabajador actualizado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler actualizar-trabajador:', error);
      throw error;
    }
  });

  // IPC handlers para trabajadores en planillas
  ipcMain.handle('obtener-trabajadores-planilla', async () => {
    console.log('Handler obtener-trabajadores-planilla llamado');
    try {
      const result = await obtenerTrabajadoresParaPlanilla();
      console.log('Trabajadores para planilla obtenidos:', result.length);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-trabajadores-planilla:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-trabajadores-por-area', async () => {
    console.log('Handler obtener-trabajadores-por-area llamado');
    try {
      const result = await obtenerTrabajadoresPorArea();
      console.log('Trabajadores por área obtenidos:', result.length, 'áreas');
      return result;
    } catch (error) {
      console.error('Error en handler obtener-trabajadores-por-area:', error);
      throw error;
    }
  });

  // IPC handlers para sistemas de pensión
  ipcMain.handle('obtener-sistemas-pension', async () => {
    console.log('Handler obtener-sistemas-pension llamado');
    try {
      const result = await obtenerSistemasPension();
      console.log('Sistemas de pensión obtenidos:', result.length);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-sistemas-pension:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-sistema-pension-por-id', async (event, id) => {
    console.log('Handler obtener-sistema-pension-por-id llamado para ID:', id);
    try {
      const result = await obtenerSistemaPorId(id);
      console.log('Sistema de pensión obtenido:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-sistema-pension-por-id:', error);
      throw error;
    }
  });

  ipcMain.handle('crear-sistema-pension', async (event, datos) => {
    console.log('Handler crear-sistema-pension llamado con datos:', datos);
    try {
      const result = await crearSistemaPension(datos);
      console.log('Sistema de pensión creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler crear-sistema-pension:', error);
      throw error;
    }
  });

  ipcMain.handle('actualizar-sistema-pension', async (event, id, datos) => {
    console.log('Handler actualizar-sistema-pension llamado para ID:', id);
    try {
      const result = await actualizarSistemaPension(id, datos);
      console.log('Sistema de pensión actualizado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler actualizar-sistema-pension:', error);
      throw error;
    }
  });

  ipcMain.handle('eliminar-sistema-pension', async (event, id) => {
    console.log('Handler eliminar-sistema-pension llamado para ID:', id);
    try {
      const result = await eliminarSistemaPension(id);
      console.log('Sistema de pensión eliminado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler eliminar-sistema-pension:', error);
      throw error;
    }
  });

  // Handlers para Conceptos
  ipcMain.handle('crear-concepto', async (event, datosConcepto) => {
    console.log('Handler crear-concepto llamado con datos:', datosConcepto);
    try {
      const result = await conceptosService.crearConcepto(datosConcepto);
      console.log('Concepto creado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler crear-concepto:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-conceptos', async (event, filtros = {}) => {
    console.log('Handler obtener-conceptos llamado con filtros:', filtros);
    try {
      const result = await conceptosService.obtenerConceptos(filtros);
      console.log(`Conceptos obtenidos exitosamente: ${result.length} registros`);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-conceptos:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-concepto-por-id', async (event, id) => {
    console.log('Handler obtener-concepto-por-id llamado para ID:', id);
    try {
      const result = await conceptosService.obtenerConceptoPorId(id);
      console.log('Concepto obtenido exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-concepto-por-id:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-estadisticas-conceptos', async () => {
    console.log('Handler obtener-estadisticas-conceptos llamado');
    try {
      const result = await conceptosService.obtenerEstadisticas();
      console.log('Estadísticas de conceptos obtenidas exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-estadisticas-conceptos:', error);
      throw error;
    }
  });

  ipcMain.handle('actualizar-concepto', async (event, id, datosConcepto) => {
    console.log('Handler actualizar-concepto llamado para ID:', id, 'con datos:', datosConcepto);
    try {
      const result = await conceptosService.actualizarConcepto(id, datosConcepto);
      console.log('Concepto actualizado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler actualizar-concepto:', error);
      throw error;
    }
  });

  // Handlers para trabajador-conceptos
  ipcMain.handle('asignar-concepto-trabajador', async (event, datos) => {
    console.log('Handler asignar-concepto-trabajador llamado con datos:', datos);
    try {
      const result = await trabajadorConceptosService.asignarConcepto(datos.id_trabajador, datos.id_concepto);
      console.log('Concepto asignado a trabajador exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler asignar-concepto-trabajador:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-conceptos-asignados-trabajador', async (event, idTrabajador) => {
    console.log('Handler obtener-conceptos-asignados-trabajador llamado para trabajador:', idTrabajador);
    try {
      const result = await trabajadorConceptosService.obtenerConceptosAsignados(idTrabajador);
      console.log('Conceptos asignados obtenidos:', result.length, 'conceptos');
      return result;
    } catch (error) {
      console.error('Error en handler obtener-conceptos-asignados-trabajador:', error);
      throw error;
    }
  });

  ipcMain.handle('desvincular-concepto-trabajador', async (event, idTrabajador, idConcepto) => {
    console.log('Handler desvincular-concepto-trabajador llamado para trabajador:', idTrabajador, 'concepto:', idConcepto);
    try {
      const result = await trabajadorConceptosService.desvincularConcepto(idTrabajador, idConcepto);
      console.log('Concepto desvinculado de trabajador exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en handler desvincular-concepto-trabajador:', error);
      throw error;
    }
  });

  ipcMain.handle('obtener-estadisticas-trabajador-conceptos', async () => {
    console.log('Handler obtener-estadisticas-trabajador-conceptos llamado');
    try {
      const result = await trabajadorConceptosService.obtenerEstadisticas();
      console.log('Estadísticas de trabajador-conceptos obtenidas:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-estadisticas-trabajador-conceptos:', error);
      throw error;
    }
  });

  // Handler para obtener conceptos de un trabajador
  ipcMain.handle('get-trabajador-conceptos', async (event, idTrabajador, tipoConcepto = null) => {
    try {
      console.log(`[IPC] Obteniendo conceptos del trabajador ${idTrabajador}, tipo: ${tipoConcepto || 'todos'}`);
      
      const resultado = await trabajadorConceptosService.obtenerConceptosPorTrabajador(idTrabajador, tipoConcepto);
      
      console.log(`[IPC] Conceptos obtenidos para trabajador ${idTrabajador}:`, resultado.conceptos?.length || 0);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error en get-trabajador-conceptos:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para obtener aportes calculados de un trabajador
  ipcMain.handle('get-trabajador-aportes', async (event, idTrabajador) => {
    try {
      console.log(`[IPC] Calculando aportes del trabajador ${idTrabajador}`);
      
      const resultado = await trabajadorConceptosService.obtenerAportesTrabajador(idTrabajador);
      
      console.log(`[IPC] Aportes calculados para trabajador ${idTrabajador}:`, resultado.aportes?.length || 0);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error en get-trabajador-aportes:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para obtener aportes del empleador de un trabajador
  ipcMain.handle('get-aportes-empleador', async (event, idTrabajador) => {
    try {
      console.log(`[IPC] Obteniendo aportes del empleador para trabajador ${idTrabajador}`);
      
      const resultado = await trabajadorConceptosService.obtenerConceptosPorTrabajador(idTrabajador, 'aporte-empleador');
      
      console.log(`[IPC] Aportes del empleador obtenidos para trabajador ${idTrabajador}:`, resultado.conceptos?.length || 0);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error en get-aportes-empleador:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // HANDLERS PARA PLANILLAS
  // ============================================
  
  // Handler para crear nueva planilla
  ipcMain.handle('crear-planilla', async (event, planillaData) => {
    try {
      console.log('[IPC] Creando nueva planilla:', planillaData);
      
      const resultado = await planillasService.crearPlanilla(planillaData);
      
      console.log('[IPC] Planilla creada exitosamente:', resultado.id_planilla);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error creando planilla:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para guardar cálculos de planilla
  ipcMain.handle('guardar-calculos-planilla', async (event, idPlanilla, datosCalculados) => {
    try {
      console.log(`[IPC] Guardando cálculos para planilla ${idPlanilla}`);
      
      const resultado = await planillasService.guardarCalculosPlanilla(idPlanilla, datosCalculados);
      
      console.log(`[IPC] Cálculos guardados exitosamente para planilla ${idPlanilla}`);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error guardando cálculos:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para listar planillas
  ipcMain.handle('listar-planillas', async (event, filtros = {}) => {
    try {
      console.log('[IPC] Listando planillas con filtros:', filtros);
      
      const resultado = await planillasService.listarPlanillas(filtros);
      
      console.log(`[IPC] Planillas obtenidas: ${resultado.planillas?.length || 0}`);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error listando planillas:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para obtener estadísticas de planillas
  ipcMain.handle('obtener-estadisticas-planillas', async (event) => {
    try {
      console.log('[IPC] Obteniendo estadísticas de planillas');
      
      const resultado = await planillasService.obtenerEstadisticas();
      
      console.log('[IPC] Estadísticas obtenidas:', resultado.estadisticas);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para obtener detalle de planilla
  ipcMain.handle('obtener-detalle-planilla', async (event, idPlanilla) => {
    try {
      console.log(`[IPC] Obteniendo detalle de planilla ${idPlanilla}`);
      
      const resultado = await planillasService.obtenerDetallePlanilla(idPlanilla);
      
      console.log(`[IPC] Detalle obtenido para planilla ${idPlanilla}`);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error obteniendo detalle:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler para actualizar estado de planilla
  ipcMain.handle('actualizar-estado-planilla', async (event, idPlanilla, nuevoEstado) => {
    try {
      console.log(`[IPC] Actualizando estado de planilla ${idPlanilla} a ${nuevoEstado}`);
      
      const resultado = await planillasService.actualizarEstadoPlanilla(idPlanilla, nuevoEstado);
      
      console.log(`[IPC] Estado actualizado para planilla ${idPlanilla}`);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error actualizando estado:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================
  // HANDLERS PARA PARAMETROS DEL SISTEMA
  // ============================================
  
  // Handler para obtener RMV
  ipcMain.handle('obtener-rmv', async () => {
    try {
      console.log('[IPC] Obteniendo RMV del sistema');
      
      const resultado = await parametrosService.obtenerRMV();
      
      console.log('[IPC] RMV obtenido:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error obteniendo RMV:', error);
      return { 
        success: true, 
        valor: 1130.00, 
        esRespaldo: true, 
        mensaje: 'RMV de respaldo' 
      };
    }
  });
  
  // Handler para obtener parámetro por código
  ipcMain.handle('obtener-parametro', async (event, codigo) => {
    try {
      console.log(`[IPC] Obteniendo parámetro: ${codigo}`);
      
      const resultado = await parametrosService.obtenerParametroPorCodigo(codigo);
      
      console.log(`[IPC] Parámetro ${codigo} obtenido:`, resultado);
      
      return resultado;
    } catch (error) {
      console.error('[IPC] Error obteniendo parámetro:', error);
      return { success: false, error: error.message };
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
