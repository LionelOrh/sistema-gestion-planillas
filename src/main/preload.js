const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
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
  obtenerEstadisticasTrabajadorConceptos: () => ipcRenderer.invoke('obtener-estadisticas-trabajador-conceptos')
});
