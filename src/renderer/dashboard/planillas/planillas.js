// Gestión de Planillas - Implementación simplificada y directa
(function() {
    'use strict';
    
    // Variables globales para datos
    let trabajadoresData = [];
    let trabajadoresPorArea = {};

    // Función para cargar trabajadores desde Electron API
    async function cargarTrabajadores() {
        try {
            console.log('[PlanillasManager] Cargando trabajadores...');
            console.log('[PlanillasManager] window.electronAPI disponible:', !!window.electronAPI);
            console.log('[PlanillasManager] Funciones disponibles:', Object.keys(window.electronAPI || {}));
            
            // Verificar que las funciones existan
            if (!window.electronAPI || !window.electronAPI.obtenerTrabajadoresParaPlanilla) {
                throw new Error('API de Electron no disponible o función no encontrada');
            }
            
            // Cargar trabajadores para planilla usando Electron API
            console.log('[PlanillasManager] Llamando a obtenerTrabajadoresParaPlanilla...');
            trabajadoresData = await window.electronAPI.obtenerTrabajadoresParaPlanilla();
            console.log('[PlanillasManager] Respuesta recibida:', trabajadoresData);
            
            // Cargar trabajadores por área usando Electron API
            console.log('[PlanillasManager] Llamando a obtenerTrabajadoresPorArea...');
            const areasData = await window.electronAPI.obtenerTrabajadoresPorArea();
            console.log('[PlanillasManager] Áreas recibidas:', areasData);
            
            // Convertir array de áreas a objeto para fácil acceso
            trabajadoresPorArea = {};
            if (Array.isArray(areasData)) {
                areasData.forEach(area => {
                    trabajadoresPorArea[area.area] = area.cantidad_trabajadores;
                });
            }
            
            console.log(`[PlanillasManager] ${trabajadoresData?.length || 0} trabajadores cargados`);
            console.log('[PlanillasManager] Trabajadores por área:', trabajadoresPorArea);
            
            // Verificar que tengamos datos
            if (!Array.isArray(trabajadoresData) || trabajadoresData.length === 0) {
                console.warn('[PlanillasManager] No se encontraron trabajadores');
                trabajadoresData = [];
            }
            
        } catch (error) {
            console.error('[PlanillasManager] Error al cargar trabajadores:', error);
            console.error('[PlanillasManager] Stack trace:', error.stack);
            // Usar datos de respaldo si hay error
            trabajadoresData = [];
            trabajadoresPorArea = {};
            
            // Mostrar error en la interfaz
            const listContainer = document.querySelector('#modalCrearPlanilla .planilla-modal-trabajadores-lista');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #e74c3c;">
                        <p><strong>Error al cargar trabajadores</strong></p>
                        <p style="font-size: 12px;">${error.message}</p>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Recargar</button>
                    </div>
                `;
            }
        }
    }

    // Función para renderizar filtros de área
    function renderizarFiltrosArea() {
        const filtrosContainer = document.querySelector('#modalCrearPlanilla .planilla-modal-filtros-grid');
        if (!filtrosContainer) {
            console.error('[PlanillasManager] Contenedor de filtros no encontrado');
            return;
        }
        
        console.log('[PlanillasManager] Renderizando filtros con', trabajadoresData.length, 'trabajadores y', Object.keys(trabajadoresPorArea).length, 'áreas');
        
        filtrosContainer.innerHTML = '';
        
        // Botón "Todos" - SIN clase active por defecto
        const totalTrabajadores = trabajadoresData.length;
        const btnTodos = document.createElement('button');
        btnTodos.className = 'planilla-modal-filtro-btn';
        btnTodos.setAttribute('data-area', 'todos');
        btnTodos.innerHTML = `
            <span class="planilla-modal-filtro-nombre">Todos</span>
            <span class="planilla-modal-filtro-count">(${totalTrabajadores})</span>
        `;
        filtrosContainer.appendChild(btnTodos);
        
        // Botones por área
        Object.keys(trabajadoresPorArea).sort().forEach(area => {
            const cantidad = trabajadoresPorArea[area];
            const btn = document.createElement('button');
            btn.className = 'planilla-modal-filtro-btn';
            btn.setAttribute('data-area', area.toLowerCase().replace(/\s+/g, '_'));
            btn.innerHTML = `
                <span class="planilla-modal-filtro-nombre">${area}</span>
                <span class="planilla-modal-filtro-count">(${cantidad})</span>
            `;
            filtrosContainer.appendChild(btn);
            console.log('[PlanillasManager] Área agregada:', area, 'con', cantidad, 'trabajadores');
        });
        
        // Agregar event listeners a los nuevos botones
        filtrosContainer.querySelectorAll('.planilla-modal-filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                seleccionarTrabajadoresPorArea(btn.dataset.area, btn);
            });
        });
        
        console.log('[PlanillasManager] Total de botones de filtro creados:', filtrosContainer.children.length);
    }

    // Función para renderizar lista de trabajadores
    function renderizarTrabajadores(trabajadoresFiltrados = null) {
        const listContainer = document.querySelector('#modalCrearPlanilla .planilla-modal-trabajadores-lista');
        if (!listContainer) {
            console.error('[PlanillasManager] Contenedor de trabajadores no encontrado');
            return;
        }
        
        const trabajadores = trabajadoresFiltrados || trabajadoresData;
        console.log('[PlanillasManager] Renderizando', trabajadores.length, 'trabajadores');
        
        listContainer.innerHTML = '';
        
        if (trabajadores.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p>No hay trabajadores disponibles</p>
                </div>
            `;
            return;
        }
        
        trabajadores.forEach(trabajador => {
            const div = document.createElement('div');
            div.className = 'planilla-modal-trabajador-item';
            div.innerHTML = `
                <label class="planilla-modal-checkbox-label">
                    <input type="checkbox" class="planilla-modal-checkbox" data-id="${trabajador.id_trabajador}">
                    <span class="planilla-modal-trabajador-nombre">${trabajador.nombres} ${trabajador.apellidos}</span>
                    <span class="planilla-modal-trabajador-detalle">${trabajador.area} - S/${parseFloat(trabajador.sueldo).toLocaleString('es-PE')}</span>
                </label>
            `;
            listContainer.appendChild(div);
        });
        
        // Agregar event listeners a los checkboxes
        listContainer.querySelectorAll('.planilla-modal-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                actualizarContador();
            });
        });
        
        // Asegurar que todos los checkboxes inicien desmarcados
        listContainer.querySelectorAll('.planilla-modal-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Actualizar contador
        actualizarContador();
        
        console.log('[PlanillasManager] Trabajadores renderizados exitosamente:', listContainer.children.length);
    }

    // Función para filtrar trabajadores (ahora solo filtra, no selecciona)
    function filtrarTrabajadores(area, btnActivo) {
        // No cambiar active states aquí, solo filtrar la vista
        let trabajadoresFiltrados;
        
        if (area === 'todos') {
            trabajadoresFiltrados = trabajadoresData;
        } else {
            // Convertir el data-area de vuelta al nombre original del área
            const areaNombre = area.replace(/_/g, ' ').toUpperCase();
            trabajadoresFiltrados = trabajadoresData.filter(trabajador => 
                trabajador.area.toUpperCase() === areaNombre
            );
        }
        
        renderizarTrabajadores(trabajadoresFiltrados);
        console.log(`[PlanillasManager] Mostrar trabajadores por área: ${area} - ${trabajadoresFiltrados.length} trabajadores`);
    }

    // Nueva función para seleccionar trabajadores por área
    function seleccionarTrabajadoresPorArea(area, btnClicked) {
        console.log(`[PlanillasManager] Seleccionando trabajadores del área: ${area}`);
        
        // Toggle del botón clickeado
        const isCurrentlyActive = btnClicked.classList.contains('active');
        btnClicked.classList.toggle('active');
        
        // Si se clickeó "Todos"
        if (area === 'todos') {
            // Desactivar todos los otros botones
            document.querySelectorAll('#modalCrearPlanilla .planilla-modal-filtro-btn').forEach(btn => {
                if (btn !== btnClicked) {
                    btn.classList.remove('active');
                }
            });
            
            // SIEMPRE mostrar todos los trabajadores
            renderizarTrabajadores(trabajadoresData);
            
            // Seleccionar o deseleccionar todos los trabajadores
            const shouldSelect = !isCurrentlyActive;
            setTimeout(() => {
                document.querySelectorAll('#modalCrearPlanilla .planilla-modal-checkbox').forEach(checkbox => {
                    checkbox.checked = shouldSelect;
                });
                actualizarContador();
            }, 50);
            
            console.log(`[PlanillasManager] ${shouldSelect ? 'Seleccionando' : 'Deseleccionando'} todos los trabajadores`);
        } else {
            // Desactivar "Todos" si se selecciona un área específica
            const btnTodos = document.querySelector('#modalCrearPlanilla .planilla-modal-filtro-btn[data-area="todos"]');
            if (btnTodos) {
                btnTodos.classList.remove('active');
            }
            
            // Obtener todas las áreas actualmente seleccionadas
            const areasActivas = Array.from(document.querySelectorAll('#modalCrearPlanilla .planilla-modal-filtro-btn.active'))
                .map(btn => btn.dataset.area)
                .filter(a => a !== 'todos');
            
            console.log('[PlanillasManager] Áreas activas:', areasActivas);
            
            // SIEMPRE mostrar todos los trabajadores
            renderizarTrabajadores(trabajadoresData);
            
            // Aplicar selección basada en las áreas activas
            setTimeout(() => {
                document.querySelectorAll('#modalCrearPlanilla .planilla-modal-checkbox').forEach(checkbox => {
                    const trabajadorId = checkbox.dataset.id;
                    const trabajador = trabajadoresData.find(t => t.id_trabajador == trabajadorId);
                    
                    if (trabajador && areasActivas.length > 0) {
                        const areaLower = trabajador.area.toLowerCase().replace(/\s+/g, '_');
                        checkbox.checked = areasActivas.includes(areaLower);
                    } else {
                        // Si no hay áreas activas, desmarcar todo
                        checkbox.checked = false;
                    }
                });
                actualizarContador();
            }, 50);
        }
        
        console.log(`[PlanillasManager] Selección completada para área: ${area}`);
    }

    // Función para actualizar contador
    function actualizarContador() {
        const checkboxes = document.querySelectorAll('#modalCrearPlanilla .planilla-modal-checkbox');
        const seleccionados = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalVisible = checkboxes.length;
        const totalTrabajadores = trabajadoresData.length;
        
        const contador = document.getElementById('contadorSeleccionados');
        if (contador) {
            contador.textContent = seleccionados;
        }
        
        const textoSeleccionados = document.querySelector('#modalCrearPlanilla .planilla-modal-seleccionados');
        if (textoSeleccionados) {
            // Mostrar total de trabajadores reales, no solo los visibles
            textoSeleccionados.innerHTML = `Seleccionados: <span id="contadorSeleccionados">${seleccionados}</span> de ${totalTrabajadores}`;
        }
        
        console.log(`[PlanillasManager] Contador actualizado: ${seleccionados} seleccionados de ${totalTrabajadores} total (${totalVisible} visibles)`);
    }

    // Función para limpiar selecciones
    function limpiarSelecciones() {
        console.log('[PlanillasManager] Limpiando todas las selecciones');
        
        // Reset active filter buttons - desactivar todos
        document.querySelectorAll('#modalCrearPlanilla .planilla-modal-filtro-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // SIEMPRE mostrar todos los trabajadores
        renderizarTrabajadores(trabajadoresData);
        
        // Uncheck all worker checkboxes después del renderizado
        setTimeout(() => {
            document.querySelectorAll('#modalCrearPlanilla .planilla-modal-checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            actualizarContador();
        }, 50);
    }

    // Función para obtener trabajadores seleccionados
    function obtenerTrabajadoresSeleccionados() {
        const checkboxesSeleccionados = Array.from(document.querySelectorAll('#modalCrearPlanilla .planilla-modal-checkbox:checked'));
        const idsSeleccionados = checkboxesSeleccionados.map(checkbox => parseInt(checkbox.dataset.id));
        const trabajadoresSeleccionados = trabajadoresData.filter(trabajador => 
            idsSeleccionados.includes(trabajador.id_trabajador)
        );
        
        console.log('[PlanillasManager] Trabajadores seleccionados:', trabajadoresSeleccionados);
        return trabajadoresSeleccionados;
    }

    // Función para inicializar valores por defecto del formulario
    function inicializarFormulario() {
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
        const anoActual = fechaActual.getFullYear();
        
        // Establecer mes actual
        const selectMes = document.getElementById('selectMes');
        if (selectMes) {
            selectMes.value = mesActual.toString();
        }
        
        // Establecer año actual (sobrescribir el valor por defecto del HTML)
        const inputAno = document.getElementById('inputAno');
        if (inputAno) {
            inputAno.value = anoActual;
            // Actualizar también el atributo min/max dinámicamente
            inputAno.min = anoActual - 5; // 5 años atrás
            inputAno.max = anoActual + 5; // 5 años adelante
        }
        
        console.log(`[PlanillasManager] Formulario inicializado: Mes ${mesActual}, Año ${anoActual}`);
    }
    
    // Función para abrir modal directamente
    function abrirModalPlanilla() {
        console.log('[PlanillasManager] Abriendo modal directamente...');
        
        const modal = document.getElementById('modalCrearPlanilla');
        if (modal) {
            // Cerrar otros modales posibles
            document.querySelectorAll('[id*="modal"], [class*="modal"].active').forEach(otroModal => {
                if (otroModal.id !== 'modalCrearPlanilla') {
                    otroModal.style.display = 'none';
                    otroModal.classList.remove('active');
                }
            });
            
            // Abrir modal de planillas con estilos inline para forzar la visualización
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            modal.style.zIndex = '99999';
            modal.classList.add('active');
            
            document.body.style.overflow = 'hidden';
            
            // Inicializar valores del formulario
            setTimeout(inicializarFormulario, 100);
            
            // Cargar trabajadores y renderizar
            setTimeout(async () => {
                try {
                    console.log('[PlanillasManager] Iniciando carga de trabajadores...');
                    
                    await cargarTrabajadores();
                    
                    if (trabajadoresData.length === 0) {
                        console.warn('[PlanillasManager] No se cargaron trabajadores');
                        const listContainer = document.querySelector('#modalCrearPlanilla .planilla-modal-trabajadores-lista');
                        if (listContainer) {
                            listContainer.innerHTML = `
                                <div style="padding: 20px; text-align: center; color: #e74c3c;">
                                    <p><strong>No se pudieron cargar los trabajadores</strong></p>
                                    <p style="font-size: 12px;">Verifique la conexión con la base de datos</p>
                                </div>
                            `;
                        }
                        return;
                    }
                    
                    console.log('[PlanillasManager] Renderizando filtros...');
                    renderizarFiltrosArea();
                    
                    console.log('[PlanillasManager] Renderizando trabajadores...');
                    renderizarTrabajadores();
                    
                    console.log('[PlanillasManager] Carga completada exitosamente');
                } catch (error) {
                    console.error('[PlanillasManager] Error en la carga inicial:', error);
                    const listContainer = document.querySelector('#modalCrearPlanilla .planilla-modal-trabajadores-lista');
                    if (listContainer) {
                        listContainer.innerHTML = `
                            <div style="padding: 20px; text-align: center; color: #e74c3c;">
                                <p><strong>Error al cargar trabajadores</strong></p>
                                <p style="font-size: 12px;">${error.message}</p>
                                <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Recargar</button>
                            </div>
                        `;
                    }
                }
            }, 200);
            
            console.log('[PlanillasManager] Modal abierto con estilos inline');
        } else {
            console.error('[PlanillasManager] Modal no encontrado');
        }
    }
    
    // Función para cerrar modal
    function cerrarModalPlanilla() {
        console.log('[PlanillasManager] Cerrando modal...');
        
        const modal = document.getElementById('modalCrearPlanilla');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = '';
            console.log('[PlanillasManager] Modal cerrado');
        }
    }
    
    // Inicialización cuando el DOM esté listo
    function inicializar() {
        console.log('[PlanillasManager] Inicializando...');
        
        // Botón agregar planilla
        const btnAgregar = document.getElementById('btnAgregarPlanilla');
        if (btnAgregar) {
            btnAgregar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[PlanillasManager] Click en botón agregar');
                abrirModalPlanilla();
            });
            console.log('[PlanillasManager] Event listener agregado al botón');
        } else {
            console.error('[PlanillasManager] Botón agregar no encontrado');
        }
        
        // Botón cancelar
        const btnCancelar = document.getElementById('btnCancelarPlanilla');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                cerrarModalPlanilla();
            });
        }
        
        // Botón crear
        const btnCrear = document.getElementById('btnCrearPlanilla');
        if (btnCrear) {
            btnCrear.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                alert('Planilla creada (funcionalidad en desarrollo)');
                cerrarModalPlanilla();
            });
        }
        
        // Click fuera del modal
        const modal = document.getElementById('modalCrearPlanilla');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    cerrarModalPlanilla();
                }
            });
        }
        
        // Tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('modalCrearPlanilla');
                if (modal && modal.style.display === 'flex') {
                    cerrarModalPlanilla();
                }
            }
        });
        
        // Botón limpiar
        const btnLimpiar = document.querySelector('#modalCrearPlanilla .planilla-modal-limpiar-btn');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                limpiarSelecciones();
            });
        }
        
        console.log('[PlanillasManager] Inicialización completada');
    }
    
    // Múltiples formas de inicialización para asegurar que funcione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }
    
    window.addEventListener('load', function() {
        // Verificar nuevamente después de que todo esté cargado
        const btnAgregar = document.getElementById('btnAgregarPlanilla');
        if (btnAgregar && !btnAgregar.hasAttribute('data-initialized')) {
            btnAgregar.setAttribute('data-initialized', 'true');
            btnAgregar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                abrirModalPlanilla();
            });
            console.log('[PlanillasManager] Event listener de respaldo agregado');
        }
    });
    
    // Función global para pruebas
    window.abrirModalPlanilla = abrirModalPlanilla;
    window.cerrarModalPlanilla = cerrarModalPlanilla;
    
})();