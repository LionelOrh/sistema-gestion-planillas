const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Método invoke genérico
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  
  login: (usuario, clave) => ipcRenderer.invoke('login', usuario, clave),
  
  // API para trabajadores
  obtenerTrabajadores: () => ipcRenderer.invoke('obtener-trabajadores'),
  obtenerTrabajadorPorId: (id) => ipcRenderer.invoke('obtener-trabajador-por-id', id),
  crearTrabajador: (datosFormulario) => ipcRenderer.invoke('crear-trabajador', datosFormulario),
  actualizarTrabajador: (id, datosFormulario) => ipcRenderer.invoke('actualizar-trabajador', id, datosFormulario),
  
  // API para trabajadores en planillas
  obtenerTrabajadoresParaPlanilla: () => ipcRenderer.invoke('obtener-trabajadores-planilla'),
  obtenerTrabajadoresPorArea: () => ipcRenderer.invoke('obtener-trabajadores-por-area'),
  
  // API para sistemas de pensión
  obtenerSistemasPension: () => ipcRenderer.invoke('obtener-sistemas-pension'),
  obtenerSistemaPensionPorId: (id) => ipcRenderer.invoke('obtener-sistema-pension-por-id', id),
  crearSistemaPension: (datos) => ipcRenderer.invoke('crear-sistema-pension', datos),
  actualizarSistemaPension: (id, datos) => ipcRenderer.invoke('actualizar-sistema-pension', id, datos),
  eliminarSistemaPension: (id) => ipcRenderer.invoke('eliminar-sistema-pension', id),

  // API para conceptos
  crearConcepto: (datosConcepto) => ipcRenderer.invoke('crear-concepto', datosConcepto),
  obtenerConceptos: (filtros) => ipcRenderer.invoke('obtener-conceptos', filtros),
  obtenerConceptoPorId: (id) => ipcRenderer.invoke('obtener-concepto-por-id', id),
  actualizarConcepto: (id, datosConcepto) => ipcRenderer.invoke('actualizar-concepto', id, datosConcepto),
  obtenerEstadisticasConceptos: () => ipcRenderer.invoke('obtener-estadisticas-conceptos'),
  
  // APIs para trabajador-conceptos
  asignarConceptoTrabajador: (datos) => ipcRenderer.invoke('asignar-concepto-trabajador', datos),
  obtenerConceptosAsignadosTrabajador: (idTrabajador) => ipcRenderer.invoke('obtener-conceptos-asignados-trabajador', idTrabajador),
  desvincularConceptoTrabajador: (idTrabajador, idConcepto) => ipcRenderer.invoke('desvincular-concepto-trabajador', idTrabajador, idConcepto),
  obtenerEstadisticasTrabajadorConceptos: () => ipcRenderer.invoke('obtener-estadisticas-trabajador-conceptos'),

  // ============================================
  // API PARA PLANILLAS
  // ============================================
  
  // Crear nueva planilla
  crearPlanilla: (planillaData) => ipcRenderer.invoke('crear-planilla', planillaData),
  
  // Guardar cálculos de planilla
  guardarCalculosPlanilla: (idPlanilla, datosCalculados) => ipcRenderer.invoke('guardar-calculos-planilla', idPlanilla, datosCalculados),
  
  // Listar planillas con filtros
  listarPlanillas: (filtros) => ipcRenderer.invoke('listar-planillas', filtros),
  
  // Obtener estadísticas de planillas
  obtenerEstadisticasPlanillas: () => ipcRenderer.invoke('obtener-estadisticas-planillas'),
  
  // Obtener detalle completo de una planilla
  obtenerDetallePlanilla: (idPlanilla) => ipcRenderer.invoke('obtener-detalle-planilla', idPlanilla),
  
  // Actualizar estado de planilla
  actualizarEstadoPlanilla: (idPlanilla, nuevoEstado) => ipcRenderer.invoke('actualizar-estado-planilla', idPlanilla, nuevoEstado),

  // ============================================
  // API PARA PARAMETROS DEL SISTEMA
  // ============================================
  
  // Obtener RMV vigente
  obtenerRMV: () => ipcRenderer.invoke('obtener-rmv'),
  
  // Obtener parámetro por código
  obtenerParametro: (codigo) => ipcRenderer.invoke('obtener-parametro', codigo),

  // ============================================
  // API PARA LICENCIAS
  // ============================================
  
  // Obtener licencias
  obtenerLicencias: (filtros) => ipcRenderer.invoke('obtener-licencias', filtros),
  
  // Obtener licencia por ID
  obtenerLicenciaPorId: (idLicencia) => ipcRenderer.invoke('obtener-licencia-por-id', idLicencia),
  
  // Crear licencia
  crearLicencia: (datosLicencia) => ipcRenderer.invoke('crear-licencia', datosLicencia),
  
  // Actualizar licencia
  actualizarLicencia: (idLicencia, datosLicencia) => ipcRenderer.invoke('actualizar-licencia', idLicencia, datosLicencia),
  
  // Eliminar licencia
  eliminarLicencia: (idLicencia) => ipcRenderer.invoke('eliminar-licencia', idLicencia),
  
  // Actualizar estado de licencia
  actualizarEstadoLicencia: (idLicencia, nuevoEstado) => ipcRenderer.invoke('actualizar-estado-licencia', idLicencia, nuevoEstado),
  
  // Obtener tipos de licencia
  obtenerTiposLicencia: () => ipcRenderer.invoke('obtener-tipos-licencia'),
  
  // Obtener estadísticas de licencias
  obtenerEstadisticasLicencias: () => ipcRenderer.invoke('obtener-estadisticas-licencias'),

  // Función para generar constancia de trabajo en PDF
  generarConstanciaPDF: (datosConstancia) => ipcRenderer.invoke('generar-constancia-pdf', datosConstancia),
});
