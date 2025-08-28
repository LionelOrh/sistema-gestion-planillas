// ============================================
// GESTIÓN DE LICENCIAS - JavaScript
// ============================================

class LicenciasManager {
    constructor() {
        console.log('[LicenciasManager] Inicializando módulo...');
        
        // Variables de instancia
        this.licenciasData = [];
        this.trabajadoresData = [];
        this.tiposLicenciaData = [];
        this.filtroEstadoActual = 'todos';
        this.licenciaEnEdicion = null;
        this.accionConfirmada = null;
        
        this.init();
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    async init() {
        this.configurarEventListeners();
        await this.cargarDatosIniciales();
    }
    
    configurarEventListeners() {
        // Botones principales
        const btnNuevaLicencia = document.getElementById('btnNuevaLicencia');
        const btnRecargar = document.getElementById('btnRecargarLicencias');
        
        if (btnNuevaLicencia) {
            btnNuevaLicencia.addEventListener('click', () => this.abrirModalNuevaLicencia());
        }
        
        if (btnRecargar) {
            btnRecargar.addEventListener('click', () => this.cargarLicencias());
        }
        
        // Filtros de estado
        const filtrosEstado = document.querySelectorAll('.filtro-estado');
        filtrosEstado.forEach(filtro => {
            filtro.addEventListener('click', (e) => this.cambiarFiltroEstado(e));
        });
        
        // Búsqueda
        const searchInput = document.getElementById('searchLicencias');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.filtrarLicencias(), 300));
        }
        
        // Modal de licencia
        this.configurarModalLicencia();
        
        // Modal de confirmación
        this.configurarModalConfirmacion();
    }
    
    configurarModalLicencia() {
        const modal = document.getElementById('modalLicencia');
        const btnCerrar = document.getElementById('btnCerrarModal');
        const btnCancelar = document.getElementById('btnCancelarModal');
        const btnGuardar = document.getElementById('btnGuardarLicencia');
        const form = document.getElementById('formLicencia');
        
        if (btnCerrar) btnCerrar.addEventListener('click', () => this.cerrarModalLicencia());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModalLicencia());
        if (btnGuardar) btnGuardar.addEventListener('click', () => this.guardarLicencia());
        
        // Cerrar al hacer clic fuera del modal
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.cerrarModalLicencia();
            });
        }
        
        // Calcular días automáticamente
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        
        if (fechaInicio && fechaFin) {
            fechaInicio.addEventListener('change', () => this.calcularDias());
            fechaFin.addEventListener('change', () => this.calcularDias());
        }
    }
    
    configurarModalConfirmacion() {
        const modal = document.getElementById('modalConfirmacion');
        const btnCancelar = document.getElementById('btnCancelarConfirmacion');
        const btnConfirmar = document.getElementById('btnConfirmarAccion');
        
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModalConfirmacion());
        if (btnConfirmar) btnConfirmar.addEventListener('click', () => this.ejecutarAccionConfirmada());
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.cerrarModalConfirmacion();
            });
        }
    }
    
    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarDatosIniciales() {
        try {
            this.mostrarCargando();
            
            // Cargar en paralelo
            const [licenciasResult, trabajadoresResult, tiposResult] = await Promise.all([
                this.cargarLicencias(),
                this.cargarTrabajadores(),
                this.cargarTiposLicencia()
            ]);
            
            console.log('[LicenciasManager] Datos iniciales cargados');
            
        } catch (error) {
            console.error('[LicenciasManager] Error cargando datos iniciales:', error);
            this.mostrarError('Error al cargar los datos iniciales');
        } finally {
            this.ocultarCargando();
        }
    }
    
    async cargarLicencias(filtros = {}) {
        try {
            console.log('[LicenciasManager] Cargando licencias...');
            
            const resultado = await window.electronAPI.obtenerLicencias(filtros);
            
            if (resultado.success) {
                this.licenciasData = resultado.licencias || [];
                this.renderizarLicencias();
                console.log(`[LicenciasManager] ${this.licenciasData.length} licencias cargadas`);
            } else {
                throw new Error(resultado.error || 'Error al cargar licencias');
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error:', error);
            this.mostrarError('Error al cargar las licencias');
        }
    }
    
    async cargarTrabajadores() {
        try {
            const resultado = await window.electronAPI.invoke('obtener-trabajadores');
            
            if (resultado && resultado.length > 0) {
                this.trabajadoresData = resultado;
                this.poblarSelectTrabajadores();
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error cargando trabajadores:', error);
        }
    }
    
    async cargarTiposLicencia() {
        try {
            const resultado = await window.electronAPI.obtenerTiposLicencia();
            
            if (resultado.success) {
                this.tiposLicenciaData = resultado.tipos || [];
                this.poblarSelectTiposLicencia();
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error cargando tipos de licencia:', error);
        }
    }
    
    // ============================================
    // RENDERIZACIÓN
    // ============================================
    
    renderizarLicencias() {
        const grid = document.getElementById('licenciasGrid');
        const noResults = document.getElementById('noResults');
        
        if (!grid) return;
        
        if (this.licenciasData.length === 0) {
            grid.style.display = 'none';
            if (noResults) noResults.style.display = 'flex';
            return;
        }
        
        grid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        grid.innerHTML = this.licenciasData.map(licencia => this.crearTarjetaLicencia(licencia)).join('');
        
        // Configurar eventos de las tarjetas
        this.configurarEventosTarjetas();
    }
    
    crearTarjetaLicencia(licencia) {
        const fechaInicio = this.formatearFecha(licencia.fecha_inicio);
        const fechaFin = this.formatearFecha(licencia.fecha_fin);
        const estado = licencia.estado.toLowerCase();
        const badgeTexto = this.obtenerTextoEstado(licencia.estado);
        
        return `
            <div class="licencia-card ${estado}" data-id="${licencia.id_licencia}">
                <div class="card-header">
                    <h3 class="card-tipo">${licencia.tipo_licencia_nombre}</h3>
                    <span class="card-badge badge-${estado}">${badgeTexto}</span>
                </div>
                
                <div class="card-body">
                    <div class="card-info">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                        </svg>
                        <strong>Empleado:</strong> ${licencia.trabajador_nombre}
                    </div>
                    
                    <div class="card-info">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                        </svg>
                        <strong>Fechas:</strong> ${fechaInicio} - ${fechaFin} 
                        <span style="color: #3498db;">(${licencia.dias} días)</span>
                    </div>
                    
                    ${licencia.motivo ? `
                        <div class="card-motivo">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px; margin-right: 4px;">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                            ${licencia.motivo}
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    ${this.obtenerBotonesAccion(licencia)}
                </div>
            </div>
        `;
    }
    
    obtenerBotonesAccion(licencia) {
        const botones = [];
        
        if (licencia.estado === 'PENDIENTE') {
            botones.push(`
                <button class="btn-action btn-aprobar" 
                        onclick="licenciasManager.aprobarLicencia(${licencia.id_licencia})"
                        title="Aprobar licencia">
                    Aprobar
                </button>
            `);
            botones.push(`
                <button class="btn-action btn-rechazar" 
                        onclick="licenciasManager.rechazarLicencia(${licencia.id_licencia})"
                        title="Rechazar licencia">
                    Rechazar
                </button>
            `);
        }
        
        botones.push(`
            <button class="btn-action btn-editar" 
                    onclick="licenciasManager.editarLicencia(${licencia.id_licencia})"
                    title="Editar licencia">
                Editar
            </button>
        `);
        
        botones.push(`
            <button class="btn-action btn-eliminar" 
                    onclick="licenciasManager.eliminarLicencia(${licencia.id_licencia})"
                    title="Eliminar licencia">
                Eliminar
            </button>
        `);
        
        return botones.join('');
    }
    
    configurarEventosTarjetas() {
        // Los eventos se configuran mediante onclick en el HTML para simplicidad
        // En una implementación más robusta, se usaría addEventListener
    }
    
    // ============================================
    // FILTRADO Y BÚSQUEDA
    // ============================================
    
    cambiarFiltroEstado(event) {
        const boton = event.target;
        const estado = boton.dataset.estado;
        
        // Actualizar UI
        document.querySelectorAll('.filtro-estado').forEach(btn => {
            btn.classList.remove('active');
        });
        boton.classList.add('active');
        
        // Aplicar filtro
        this.filtroEstadoActual = estado;
        this.aplicarFiltros();
    }
    
    filtrarLicencias() {
        this.aplicarFiltros();
    }
    
    aplicarFiltros() {
        const busqueda = document.getElementById('searchLicencias')?.value.toLowerCase() || '';
        
        let licenciasFiltradas = this.licenciasData.filter(licencia => {
            // Filtro por estado
            const coincideEstado = this.filtroEstadoActual === 'todos' || 
                                 licencia.estado === this.filtroEstadoActual;
            
            // Filtro por búsqueda
            const coincideBusqueda = !busqueda || 
                                   licencia.trabajador_nombre.toLowerCase().includes(busqueda) ||
                                   licencia.tipo_licencia_nombre.toLowerCase().includes(busqueda);
            
            return coincideEstado && coincideBusqueda;
        });
        
        // Renderizar resultados filtrados
        const gridOriginal = this.licenciasData;
        this.licenciasData = licenciasFiltradas;
        this.renderizarLicencias();
        this.licenciasData = gridOriginal; // Restaurar datos originales
    }
    
    // ============================================
    // MODAL DE LICENCIA
    // ============================================
    
    abrirModalNuevaLicencia() {
        this.licenciaEnEdicion = null;
        
        document.getElementById('modalTitle').textContent = 'Nueva Solicitud de Licencia';
        
        // Limpiar formulario
        const form = document.getElementById('formLicencia');
        if (form) form.reset();
        
        // Estado por defecto
        document.getElementById('selectEstado').value = 'PENDIENTE';
        
        // Mostrar modal
        document.getElementById('modalLicencia').style.display = 'flex';
    }
    
    async editarLicencia(idLicencia) {
        try {
            const resultado = await window.electronAPI.obtenerLicenciaPorId(idLicencia);
            if (resultado.success) {
                this.licenciaEnEdicion = resultado.licencia;
                document.getElementById('modalTitle').textContent = 'Editar Licencia';
                
                // Llenar formulario con validaciones
                const selectTrabajador = document.getElementById('selectTrabajador');
                const selectTipoLicencia = document.getElementById('selectTipoLicencia');
                const fechaInicio = document.getElementById('fechaInicio');
                const fechaFin = document.getElementById('fechaFin');
                const selectEstado = document.getElementById('selectEstado');
                const textareaMotivo = document.getElementById('textareaMotivo');
                
                if (selectTrabajador) {
                    selectTrabajador.value = this.licenciaEnEdicion.id_trabajador || '';
                }
                
                if (selectTipoLicencia) {
                    selectTipoLicencia.value = this.licenciaEnEdicion.id_tipo_licencia || '';
                }
                
                if (fechaInicio && this.licenciaEnEdicion.fecha_inicio) {
                    fechaInicio.value = this.formatearFechaParaInput(this.licenciaEnEdicion.fecha_inicio);
                }
                
                if (fechaFin && this.licenciaEnEdicion.fecha_fin) {
                    fechaFin.value = this.formatearFechaParaInput(this.licenciaEnEdicion.fecha_fin);
                }
                
                if (selectEstado) {
                    selectEstado.value = this.licenciaEnEdicion.estado || 'PENDIENTE';
                }
                
                if (textareaMotivo) {
                    textareaMotivo.value = this.licenciaEnEdicion.motivo || '';
                }
                
                // Switch "Con goce de haber"
                const switchConGose = document.getElementById('switchConGose');
                if (switchConGose) {
                    switchConGose.checked = resultado.licencia.con_gose == 1;
                }
                
                // Calcular días después de establecer las fechas
                setTimeout(() => {
                    this.calcularDias();
                }, 100);
                
                // Mostrar modal
                document.getElementById('modalLicencia').style.display = 'flex';
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error editando licencia:', error);
            this.mostrarError('Error al cargar los datos de la licencia');
        }
    }
    
    cerrarModalLicencia() {
        const modal = document.getElementById('modalLicencia');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Limpiar formulario
        const form = document.getElementById('formLicencia');
        if (form) {
            form.reset();
        }
        
        // Limpiar estado de edición
        this.licenciaEnEdicion = null;
        
        console.log('[LicenciasManager] Modal cerrado y estado limpiado');
    }
    
    calcularDias() {
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        const diasCalculados = document.getElementById('diasCalculados');
        
        if (!fechaInicio || !fechaFin || !diasCalculados) {
            console.warn('[LicenciasManager] Elementos de fecha no encontrados');
            return;
        }
        
        const valorInicio = fechaInicio.value;
        const valorFin = fechaFin.value;
        
        if (valorInicio && valorFin) {
            try {
                const inicio = new Date(valorInicio);
                const fin = new Date(valorFin);
                
                // Verificar que las fechas son válidas
                if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                    console.warn('[LicenciasManager] Fechas inválidas:', valorInicio, valorFin);
                    diasCalculados.value = '';
                    return;
                }
                
                if (fin >= inicio) {
                    const diferenciaTiempo = fin.getTime() - inicio.getTime();
                    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1;
                    diasCalculados.value = diferenciaDias;
                    console.log('[LicenciasManager] Días calculados:', diferenciaDias);
                } else {
                    diasCalculados.value = '';
                    console.warn('[LicenciasManager] Fecha fin anterior a fecha inicio');
                }
            } catch (error) {
                console.error('[LicenciasManager] Error calculando días:', error);
                diasCalculados.value = '';
            }
        } else {
            diasCalculados.value = '';
        }
    }
    
    procesarDatosFormularioLicencia(formData) {
        const data = Object.fromEntries(formData);

        // Mapeo de campos
        const licenciaData = {
            idTrabajador: parseInt(data['idTrabajador']) || null,
            idTipoLicencia: parseInt(data['idTipoLicencia']) || null,
            fechaInicio: data['fechaInicio'] || null,
            fechaFin: data['fechaFin'] || null,
            motivo: data['motivo']?.trim() || null,
            estado: data['estado'] || 'PENDIENTE',
            dias: parseInt(data['dias']) || null,
            // Switch "Con goce de haber"
            conGose: data['conGose'] === '1' || data['conGose'] === 'on' ? 1 : 0
        };

        // Si el checkbox no está en FormData, buscar el input manualmente
        if (!('conGose' in data)) {
            const switchConGose = document.getElementById('switchConGose');
            licenciaData.conGose = switchConGose && switchConGose.checked ? 1 : 0;
        }

        return licenciaData;
    }
    
    async guardarLicencia() {
        try {
            const form = document.getElementById('formLicencia');
            const formData = new FormData(form);
            const datosLicencia = this.procesarDatosFormularioLicencia(formData);

            console.log('[LicenciasManager] Datos a guardar:', datosLicencia);

            // Validaciones
            if (!datosLicencia.idTrabajador || isNaN(datosLicencia.idTrabajador)) {
                this.mostrarError('Debe seleccionar un empleado');
                return;
            }
            
            if (!datosLicencia.idTipoLicencia || isNaN(datosLicencia.idTipoLicencia)) {
                this.mostrarError('Debe seleccionar un tipo de licencia');
                return;
            }
            
            if (!datosLicencia.fechaInicio || !datosLicencia.fechaFin) {
                this.mostrarError('Debe especificar las fechas de inicio y fin');
                return;
            }
            
            if (new Date(datosLicencia.fechaFin) < new Date(datosLicencia.fechaInicio)) {
                this.mostrarError('La fecha de fin debe ser posterior a la fecha de inicio');
                return;
            }
            
            let resultado;
            if (this.licenciaEnEdicion && this.licenciaEnEdicion.id_licencia) {
                resultado = await window.electronAPI.actualizarLicencia(
                    this.licenciaEnEdicion.id_licencia,
                    datosLicencia
                );
            } else {
                resultado = await window.electronAPI.crearLicencia(datosLicencia);
            }

            if (resultado.success) {
                this.mostrarExito(resultado.message);
                this.cerrarModalLicencia();
                await this.cargarLicencias();
            } else {
                this.mostrarError(resultado.error || 'Error al guardar la licencia');
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error guardando licencia:', error);
            this.mostrarError('Error al guardar la licencia');
        }
    }
    
    // ============================================
    // ACCIONES DE LICENCIAS
    // ============================================
    
    aprobarLicencia(idLicencia) {
        this.mostrarConfirmacion(
            'Aprobar Licencia',
            '¿Deseas aprobar esta licencia?',
            () => this.cambiarEstadoLicencia(idLicencia, 'ACTIVA')
        );
    }
    
    rechazarLicencia(idLicencia) {
        this.mostrarConfirmacion(
            'Rechazar Licencia',
            '¿Deseas rechazar esta licencia?',
            () => this.cambiarEstadoLicencia(idLicencia, 'CANCELADA')
        );
    }
    
    eliminarLicencia(idLicencia) {
        this.mostrarConfirmacion(
            'Eliminar Licencia',
            '¿Estás seguro de que deseas eliminar esta licencia? Esta acción no se puede deshacer.',
            async () => {
                try {
                    const resultado = await window.electronAPI.eliminarLicencia(idLicencia);
                    
                    if (resultado.success) {
                        this.mostrarExito('Licencia eliminada exitosamente');
                        await this.cargarLicencias();
                    } else {
                        this.mostrarError(resultado.error || 'Error al eliminar la licencia');
                    }
                } catch (error) {
                    console.error('[LicenciasManager] Error eliminando licencia:', error);
                    this.mostrarError('Error al eliminar la licencia');
                }
            }
        );
    }
    
    async cambiarEstadoLicencia(idLicencia, nuevoEstado) {
        try {
            const resultado = await window.electronAPI.actualizarEstadoLicencia(idLicencia, nuevoEstado);
            
            if (resultado.success) {
                this.mostrarExito(`Estado actualizado a ${this.obtenerTextoEstado(nuevoEstado)}`);
                this.cargarLicencias();
            } else {
                this.mostrarError(resultado.error || 'Error al actualizar el estado');
            }
            
        } catch (error) {
            console.error('[LicenciasManager] Error cambiando estado:', error);
            this.mostrarError('Error al cambiar el estado de la licencia');
        }
    }
    
    // ============================================
    // MODAL DE CONFIRMACIÓN
    // ============================================
    
    mostrarConfirmacion(titulo, mensaje, callback) {
        document.getElementById('confirmacionTitle').textContent = titulo;
        document.getElementById('confirmacionMensaje').textContent = mensaje;
        document.getElementById('modalConfirmacion').style.display = 'flex';
        this.accionConfirmada = callback;
    }
    
    cerrarModalConfirmacion() {
        document.getElementById('modalConfirmacion').style.display = 'none';
        this.accionConfirmada = null;
    }
    
    ejecutarAccionConfirmada() {
        if (this.accionConfirmada) {
            this.accionConfirmada();
            this.cerrarModalConfirmacion();
        }
    }
    
    // ============================================
    // HELPERS PARA SELECTS
    // ============================================
    
    poblarSelectTrabajadores() {
        const select = document.getElementById('selectTrabajador');
        if (!select) return;
        
        // Mantener la opción inicial
        select.innerHTML = '<option value="">Selecciona un empleado...</option>';
        
        this.trabajadoresData.forEach(trabajador => {
            const option = document.createElement('option');
            option.value = trabajador.id_trabajador;
            option.textContent = `${trabajador.nombres} ${trabajador.apellidos} - ${trabajador.area}`;
            select.appendChild(option);
        });
    }
    
    poblarSelectTiposLicencia() {
        const select = document.getElementById('selectTipoLicencia');
        if (!select) return;
        
        // Mantener la opción inicial
        select.innerHTML = '<option value="">Selecciona el tipo...</option>';
        
        this.tiposLicenciaData.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id_tipo_licencia;
            option.textContent = tipo.nombre;
            if (tipo.descripcion) {
                option.title = tipo.descripcion;
            }
            select.appendChild(option);
        });
    }
    
    // ============================================
    // UTILIDADES
    // ============================================
    
    formatearFecha(fecha) {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-PE');
    }
    
    formatearFechaParaInput(fecha) {
        if (!fecha) return '';
        
        try {
            const date = new Date(fecha);
            // Verificar que la fecha es válida
            if (isNaN(date.getTime())) {
                console.warn('[LicenciasManager] Fecha inválida:', fecha);
                return '';
            }
            
            // Formatear en YYYY-MM-DD para inputs de tipo date
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('[LicenciasManager] Error formateando fecha:', fecha, error);
            return '';
        }
    }
    
    obtenerTextoEstado(estado) {
        const estados = {
            'PENDIENTE': 'Pendiente',
            'ACTIVA': 'Activa',
            'CONCLUIDA': 'Concluida',
            'CANCELADA': 'Cancelada'
        };
        return estados[estado] || estado;
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    mostrarCargando() {
        const loading = document.querySelector('.loading-licencias');
        if (loading) loading.style.display = 'flex';
    }
    
    ocultarCargando() {
        const loading = document.querySelector('.loading-licencias');
        if (loading) loading.style.display = 'none';
    }
    
    mostrarError(mensaje) {
        // Implementar sistema de notificaciones
        console.error('[LicenciasManager]', mensaje);
        alert('Error: ' + mensaje); // Temporal
    }
    
    mostrarExito(mensaje) {
        // Implementar sistema de notificaciones
        console.log('[LicenciasManager]', mensaje);
        // alert('Éxito: ' + mensaje); // Temporal
    }
}

// ============================================
// INSTANCIACIÓN GLOBAL
// ============================================

// Variable global para acceso desde HTML
let licenciasManager;

// Crear instancia cuando se carga el módulo
window.LicenciasManager = LicenciasManager;

// Instanciar automáticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        licenciasManager = new LicenciasManager();
    });
} else {
    licenciasManager = new LicenciasManager();
}

