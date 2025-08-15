// Gestión de Planillas - Implementación simplificada y directa
(function() {
    'use strict';
    
    // Variables globales para datos
    let trabajadoresData = [];
    let trabajadoresPorArea = {};
    let planillaActualId = null; // ID de la planilla que se está editando
    let planillasData = []; // Array de planillas cargadas
    let vistaPreviaCalculada = false; // Estado de la vista previa
    let datosVistaPreviaGuardados = null; // Datos guardados de vista previa

    // ============================================
    // FUNCIONES DE CARGA INICIAL
    // ============================================
    
    // Función para cargar planillas existentes
    async function cargarPlanillas(filtros = {}) {
        try {
            console.log('[PlanillasManager] Cargando planillas...');
            
            if (!window.electronAPI || !window.electronAPI.listarPlanillas) {
                throw new Error('API de planillas no disponible');
            }
            
            const response = await window.electronAPI.listarPlanillas(filtros);
            
            if (response.success) {
                planillasData = response.planillas || [];
                console.log(`[PlanillasManager] ${planillasData.length} planillas cargadas`);
                
                // Actualizar la tabla
                actualizarTablaPlanillas();
                
                // Actualizar estadísticas
                await cargarEstadisticasPlanillas();
                
                return planillasData;
            } else {
                throw new Error(response.error || 'Error cargando planillas');
            }
            
        } catch (error) {
            console.error('[PlanillasManager] Error cargando planillas:', error);
            planillasData = [];
            mostrarErrorEnTabla('Error cargando planillas: ' + error.message);
            return [];
        }
    }
    
    // Función para cargar estadísticas
    async function cargarEstadisticasPlanillas() {
        try {
            if (!window.electronAPI || !window.electronAPI.obtenerEstadisticasPlanillas) {
                console.warn('[PlanillasManager] API de estadísticas no disponible');
                return;
            }
            
            const response = await window.electronAPI.obtenerEstadisticasPlanillas();
            
            if (response.success) {
                const stats = response.estadisticas;
                
                // Actualizar las tarjetas de estadísticas
                actualizarTarjetasEstadisticas(stats);
                
                // Actualizar contador en el header
                const contadorElement = document.querySelector('.planillas-contador');
                if (contadorElement) {
                    contadorElement.textContent = `${stats.planillasActivas} planillas activas • ${stats.totalPlanillas} planillas totales`;
                }
                
                console.log('[PlanillasManager] Estadísticas actualizadas:', stats);
            }
            
        } catch (error) {
            console.error('[PlanillasManager] Error cargando estadísticas:', error);
        }
    }
    
    // Función para actualizar las tarjetas de estadísticas
    function actualizarTarjetasEstadisticas(stats) {
        // Planillas Activas
        const activasElement = document.querySelector('.stat-card .stat-number');
        if (activasElement) {
            activasElement.textContent = stats.planillasActivas || 0;
        }
        
        // Total Pagado 2025 - Usar cálculo local basado en datos de la tabla
        actualizarTotalPagado2025();
        
        // Trabajadores (este viene del sistema general)
        const pagadoElements = document.querySelectorAll('.stat-card .stat-number');
        if (pagadoElements[2]) {
            pagadoElements[2].textContent = stats.totalTrabajadores || 0;
        }
    }
    
    // Función para cargar todos los datos iniciales al entrar a la interfaz
    async function cargarDatosIniciales() {
        try {
            console.log('[PlanillasManager] Cargando datos iniciales de la interfaz...');
            
            // Mostrar indicador de carga
            mostrarIndicadorCarga();
            
            // Cargar planillas automáticamente
            const planillas = await cargarPlanillas();
            
            console.log('[PlanillasManager] Datos iniciales cargados exitosamente');
            
            // Mostrar mensaje temporal de éxito
            if (planillas.length > 0) {
                mostrarMensajeTemporalExito(`✅ ${planillas.length} planilla${planillas.length > 1 ? 's' : ''} cargada${planillas.length > 1 ? 's' : ''}`);
            } else {
                mostrarMensajeTemporalInfo('ℹ️ No hay planillas registradas. Cree una nueva planilla para comenzar.');
            }
            
        } catch (error) {
            console.error('[PlanillasManager] Error cargando datos iniciales:', error);
            mostrarErrorEnTabla('Error cargando datos iniciales: ' + error.message);
            mostrarMensajeTemporalError('❌ Error cargando planillas: ' + error.message);
        } finally {
            // Ocultar indicador de carga
            ocultarIndicadorCarga();
        }
    }
    
    // Función para mostrar indicador de carga en la tabla
    function mostrarIndicadorCarga() {
        const tbody = document.querySelector('.planillas-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="tabla-cargando">
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                            <div class="spinner" style="width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #2196F3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                            <p>Cargando planillas...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    // Función para ocultar indicador de carga
    function ocultarIndicadorCarga() {
        const filaCargando = document.querySelector('.tabla-cargando');
        if (filaCargando) {
            filaCargando.remove();
        }
    }
    
    // Funciones para mostrar mensajes temporales
    function mostrarMensajeTemporalExito(mensaje) {
        mostrarMensajeTemporal(mensaje, 'success');
    }
    
    function mostrarMensajeTemporalError(mensaje) {
        mostrarMensajeTemporal(mensaje, 'error');
    }
    
    function mostrarMensajeTemporalInfo(mensaje) {
        mostrarMensajeTemporal(mensaje, 'info');
    }
    
    function mostrarMensajeTemporal(mensaje, tipo = 'info') {
        // Crear elemento del mensaje
        const mensajeElement = document.createElement('div');
        mensajeElement.className = `mensaje-temporal mensaje-${tipo}`;
        mensajeElement.innerHTML = `
            <div class="mensaje-temporal-content">
                <span>${mensaje}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: 10px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        // Agregar estilos
        mensajeElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 6px;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
            font-size: 14px;
            font-weight: 500;
        `;
        
        // Colores según tipo
        if (tipo === 'success') {
            mensajeElement.style.backgroundColor = '#d4edda';
            mensajeElement.style.color = '#155724';
            mensajeElement.style.borderLeft = '4px solid #28a745';
        } else if (tipo === 'error') {
            mensajeElement.style.backgroundColor = '#f8d7da';
            mensajeElement.style.color = '#721c24';
            mensajeElement.style.borderLeft = '4px solid #dc3545';
        } else {
            mensajeElement.style.backgroundColor = '#d1ecf1';
            mensajeElement.style.color = '#0c5460';
            mensajeElement.style.borderLeft = '4px solid #17a2b8';
        }
        
        // Agregar al DOM
        document.body.appendChild(mensajeElement);
        
        // Remover automáticamente después de 5 segundos
        setTimeout(() => {
            if (mensajeElement.parentElement) {
                mensajeElement.remove();
            }
        }, 5000);
    }
    
    // Función para mostrar error en la tabla
    function mostrarErrorEnTabla(mensaje) {
        const tbody = document.querySelector('.planillas-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #e74c3c;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3; margin-bottom: 10px;">
                            <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                        <p><strong>Error</strong></p>
                        <small>${mensaje}</small>
                    </td>
                </tr>
            `;
        }
    }
    
    // Función para actualizar la tabla de planillas
    function actualizarTablaPlanillas() {
        const tbody = document.querySelector('.planillas-table tbody');
        if (!tbody) return;
        
        if (planillasData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3; margin-bottom: 10px;">
                            <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M19,19H5V5H19V19Z"/>
                        </svg>
                        <p>No hay planillas registradas</p>
                        <small>Cree una nueva planilla para comenzar</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = planillasData.map(planilla => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${planilla.nombre}</div>
                    <small style="color: #666;">${planilla.totalTrabajadores} trabajadores</small>
                </td>
                <td>${planilla.periodo}</td>
                <td>
                    <span class="badge badge-${planilla.tipo.toLowerCase()}">${planilla.tipo}</span>
                </td>
                <td style="font-weight: 500;">
                    S/ ${planilla.totalNeto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td>
                    <span class="badge badge-estado badge-${planilla.estado}">${obtenerTextoEstado(planilla.estado)}</span>
                </td>
                <td>
                    <div class="acciones-grupo">
                        ${planilla.estado === 'borrador' ? `
                            <button class="btn-accion btn-calcular" onclick="abrirCalculadoraPlanilla(${planilla.id})" title="Calcular">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H17V17H7V15Z"/>
                                </svg>
                            </button>
                        ` : ''}
                        ${planilla.estado !== 'borrador' ? `
                            <button class="btn-accion btn-ver" onclick="verDetallePlanilla(${planilla.id})" title="Ver detalle">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-accion btn-menu" onclick="mostrarMenuPlanilla(${planilla.id})" title="Más opciones">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Asegurar que el scroll se active correctamente con contenido dinámico
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            // Trigger reflow para asegurar que las propiedades de scroll se apliquen
            setTimeout(() => {
                tableContainer.scrollTop = 0; // Reset scroll position
                // Force recalculation of scroll properties
                const scrollHeight = tableContainer.scrollHeight;
                const clientHeight = tableContainer.clientHeight;
                if (scrollHeight > clientHeight) {
                    tableContainer.style.overflowY = 'auto';
                }
            }, 50);
        }
        
        // Actualizar el total pagado 2025
        actualizarTotalPagado2025();
    }
    
    // Función para calcular y actualizar el Total Pagado 2025
    function actualizarTotalPagado2025() {
        try {
            console.log('[PlanillasManager] Actualizando Total Pagado 2025...');
            console.log('[PlanillasManager] Planillas disponibles:', planillasData);
            
            // Filtrar y sumar solo planillas del 2025 que estén pagadas o finalizadas
            const planillasFiltradas = planillasData.filter(planilla => {
                // Verificar que sea del año 2025 y que esté en estado pagada o finalizada
                const esDel2025 = planilla.periodo && planilla.periodo.includes('2025');
                const estaPagadaOFinalizada = planilla.estado === 'pagada' || planilla.estado === 'finalizada';
                
                const incluir = esDel2025 && estaPagadaOFinalizada;
                console.log(`[PlanillasManager] Planilla "${planilla.nombre}": periodo=${planilla.periodo}, estado=${planilla.estado}, incluir=${incluir}`);
                
                return incluir;
            });
            
            const totalPagado = planillasFiltradas.reduce((sum, planilla) => {
                const monto = parseFloat(planilla.totalNeto) || 0;
                console.log(`[PlanillasManager] Sumando planilla "${planilla.nombre}": S/ ${monto}`);
                return sum + monto;
            }, 0);
            
            console.log(`[PlanillasManager] Total calculado para 2025: S/ ${totalPagado}`);
            
            // Buscar el elemento de la tarjeta de Total Pagado 2025
            const statCards = document.querySelectorAll('.stat-card');
            
            statCards.forEach((card, index) => {
                const label = card.querySelector('.stat-label');
                const number = card.querySelector('.stat-number');
                
                if (label && label.textContent.includes('Total Pagado 2025') && number) {
                    const montoFormateado = `S/ ${totalPagado.toLocaleString('es-PE', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                    })}`;
                    
                    number.textContent = montoFormateado;
                    console.log(`[PlanillasManager] Total Pagado 2025 actualizado en tarjeta ${index}: ${montoFormateado}`);
                }
            });
            
            return totalPagado;
            
        } catch (error) {
            console.error('[PlanillasManager] Error actualizando Total Pagado 2025:', error);
            return 0;
        }
    }
    
    // Función auxiliar para obtener texto del estado
    function obtenerTextoEstado(estado) {
        const estados = {
            'borrador': 'Borrador',
            'calculada': 'Calculada',
            'procesando': 'Procesando',
            'finalizada': 'Finalizada',
            'pagada': 'Pagada'
        };
        return estados[estado] || estado;
    }

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

    // Función para cerrar modal de planilla
    function cerrarModalPlanilla() {
        const modal = document.getElementById('modalCrearPlanilla');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    // Función para abrir modal de calculadora
    function abrirModalCalculadora(trabajadoresSeleccionados, idPlanilla = null, datosExistentes = null) {
        console.log('[PlanillasManager] Abriendo modal calculadora con', {
            trabajadores: trabajadoresSeleccionados?.length || 0,
            idPlanilla,
            datosExistentes: !!datosExistentes
        });
        
        const modal = document.getElementById('modalCalculadoraPlanilla');
        if (modal) {
            // Abrir modal
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
            
            // Establecer ID de planilla actual
            if (idPlanilla) {
                planillaActualId = idPlanilla;
            }
            
            // Inicializar estado bloqueado de vista previa
            inicializarVistaPrevia();
            
            // Actualizar información del modal
            actualizarInfoCalculadora(trabajadoresSeleccionados, datosExistentes);
            
            // Configurar navegación de interfaces
            configurarNavegacionCalculadora();
            
            console.log('[PlanillasManager] Modal calculadora abierto');
        } else {
            console.error('[PlanillasManager] Modal calculadora no encontrado');
        }
    }

    // Función para inicializar vista previa en estado bloqueado
    function inicializarVistaPrevia() {
        try {
            // Bloquear botón de navegación
            const btnVistaPrevia = document.getElementById('btnVistaPrevia');
            if (btnVistaPrevia) {
                btnVistaPrevia.classList.add('disabled');
            }
            
            // Mostrar estado bloqueado
            const vistaBloqueada = document.getElementById('vistaPreviaBloqueado');
            const vistaDesbloqueada = document.getElementById('vistaPreviewDesbloqueado');
            
            if (vistaBloqueada) {
                vistaBloqueada.style.display = 'flex';
            }
            
            if (vistaDesbloqueada) {
                vistaDesbloqueada.style.display = 'none';
            }
            
            console.log('[PlanillasManager] Vista previa inicializada en estado bloqueado');
        } catch (error) {
            console.error('[PlanillasManager] Error inicializando vista previa:', error);
        }
    }

    // Función para actualizar información del modal calculadora
    async function actualizarInfoCalculadora(trabajadoresSeleccionados, datosExistentes = null) {
        try {
            console.log('[PlanillasManager] actualizarInfoCalculadora - Parámetros recibidos:', {
                trabajadoresSeleccionados,
                datosExistentes,
                tipoTrabajadores: Array.isArray(trabajadoresSeleccionados) ? 'array' : typeof trabajadoresSeleccionados,
                cantidadTrabajadores: trabajadoresSeleccionados?.length || 0
            });
            
            let trabajadores = trabajadoresSeleccionados;
            
            // Si tenemos datos existentes, usar esos trabajadores
            if (datosExistentes && datosExistentes.trabajadores) {
                trabajadores = datosExistentes.trabajadores;
                console.log('[PlanillasManager] Usando trabajadores de planilla existente:', trabajadores.length);
            } else if (!trabajadores) {
                console.log('[PlanillasManager] No hay trabajadores, inicializando array vacío');
                trabajadores = [];
            }
            
            // Log detallado de los trabajadores
            if (trabajadores && trabajadores.length > 0) {
                console.log('[PlanillasManager] Primer trabajador:', trabajadores[0]);
                trabajadores.forEach((trabajador, index) => {
                    console.log(`[PlanillasManager] Trabajador ${index + 1}:`, {
                        id: trabajador.id_trabajador || trabajador.id,
                        nombre: trabajador.nombres || trabajador.nombre,
                        apellidos: trabajador.apellidos || trabajador.apellido,
                        cargo: trabajador.cargo,
                        area: trabajador.area
                    });
                });
            } else {
                console.log('[PlanillasManager] No hay trabajadores para mostrar');
            }
            
            // Actualizar título del modal
            const titulo = document.querySelector('.calculadora-modal-subtitulo');
            if (titulo && datosExistentes) {
                titulo.textContent = datosExistentes.nombre || 'Planilla Variable';
            }
            
            // Actualizar información en el header
            const infoElement = document.querySelector('.calculadora-modal-info');
            if (infoElement) {
                const totalConceptos = 17; // Placeholder - debería ser dinámico
                infoElement.textContent = `${trabajadores.length} trabajadores • ${totalConceptos} conceptos`;
            }
            
            // Generar secciones dinámicas para cada trabajador
            await generarSeccionesTrabajadores(trabajadores);
            
            console.log('[PlanillasManager] Información del modal actualizada');
        } catch (error) {
            console.error('[PlanillasManager] Error actualizando información del modal:', error);
        }
    }

    // Función para generar secciones dinámicas de trabajadores
    async function generarSeccionesTrabajadores(trabajadoresSeleccionados) {
        console.log('[PlanillasManager] Generando secciones para', trabajadoresSeleccionados.length, 'trabajadores');
        
        const container = document.getElementById('trabajadoresContainer');
        
        if (!container) {
            console.error('[PlanillasManager] Contenedor de trabajadores no encontrado');
            return;
        }
        
        // Mostrar loading mientras se cargan los conceptos
        container.innerHTML = '<div class="loading-conceptos" style="text-align: center; padding: 40px; color: #666;"><p>Cargando conceptos de los trabajadores...</p></div>';
        
        try {
            // Generar una sección por cada trabajador (apiladas verticalmente)
            for (let i = 0; i < trabajadoresSeleccionados.length; i++) {
                const trabajador = trabajadoresSeleccionados[i];
                console.log(`[PlanillasManager] Procesando trabajador ${i + 1}/${trabajadoresSeleccionados.length}: ${trabajador.nombres}`);
                
                const seccionTrabajador = await crearSeccionTrabajador(trabajador, i);
                
                // Si es el primer trabajador, limpiar el loading
                if (i === 0) {
                    container.innerHTML = '';
                }
                
                container.appendChild(seccionTrabajador);
            }
            
            console.log('[PlanillasManager] Se generaron', trabajadoresSeleccionados.length, 'secciones de trabajadores con sus conceptos');
            
            // Actualizar las tarjetas de resumen con los totales calculados
            setTimeout(() => {
                // Recalcular aportes del empleador para todos los trabajadores
                const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
                seccionesTrabajadores.forEach(seccion => {
                    const trabajadorId = seccion.dataset.trabajadorId;
                    recalcularAportesEmpleador(seccion, trabajadorId);
                });
                
                actualizarTarjetasResumen();
                // Inicializar también la tabla de resumen por conceptos
                actualizarResumenPorConceptos();
            }, 100);
        } catch (error) {
            console.error('[PlanillasManager] Error generando secciones:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <p><strong>Error cargando conceptos</strong></p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Función para crear la sección de un trabajador
    async function crearSeccionTrabajador(trabajador, index) {
        console.log(`[PlanillasManager] Creando sección para trabajador ${index + 1}:`, trabajador);
        
        const seccion = document.createElement('div');
        seccion.className = 'calculadora-trabajador-section';
        seccion.dataset.trabajadorIndex = index;
        seccion.dataset.trabajadorId = trabajador.id_trabajador || trabajador.id;
        
        // Obtener datos del trabajador de forma robusta
        const trabajadorId = trabajador.id_trabajador || trabajador.id;
        const nombres = trabajador.trabajador_nombres || trabajador.nombres || trabajador.nombre || 'Sin nombre';
        const apellidos = trabajador.trabajador_apellidos || trabajador.apellidos || trabajador.apellido || '';
        const area = trabajador.trabajador_area || trabajador.area || trabajador.departamento || 'Sin área';
        const sueldo = parseFloat(trabajador.sueldo_basico || trabajador.sueldo || trabajador.salario || 0);
        
        console.log(`[PlanillasManager] Datos normalizados:`, {
            id: trabajadorId,
            nombres,
            apellidos,
            area,
            sueldo
        });
        
        // Cargar conceptos de ingresos y aportes para este trabajador
        const [conceptosIngresos, aportesTrabajador, aportesEmpleador] = await Promise.all([
            cargarConceptosIngresos(trabajadorId),
            cargarAportesTrabajador(trabajadorId),
            cargarAportesEmpleador(trabajadorId)
        ]);
        
        // Generar HTML de conceptos y aportes dinámicos
        const ingresosHTML = await generarConceptosIngresosHTML(conceptosIngresos, trabajador);
        const aportesHTML = generarAportesHTML(aportesTrabajador);
        const aportesEmpleadorHTML = generarAportesEmpleadorHTML(aportesEmpleador, trabajador);
        // Calcular el neto a pagar para este trabajador de forma simplificada
        let totalIngresos = sueldo;
        
        // Sumar conceptos de ingresos
        conceptosIngresos.forEach(concepto => {
            let montoConcepto = 0;
            if (concepto.tipo_calculo === 'monto-fijo') {
                montoConcepto = parseFloat(concepto.valor) || 0;
            } else if (concepto.tipo_calculo === 'porcentaje') {
                montoConcepto = (totalIngresos * parseFloat(concepto.valor)) / 100;
            }
            totalIngresos += montoConcepto;
        });
        
        // Sumar aportes del trabajador
        let totalAportes = 0;
        aportesTrabajador.forEach(aporte => {
            totalAportes += parseFloat(aporte.monto) || 0;
        });
        
        // Calcular neto
        const neto = totalIngresos - totalAportes;
        const netoMostrar = neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        seccion.innerHTML = `
            <!-- Información del Trabajador -->
            <div class="calculadora-trabajador-header">
                <h3 class="calculadora-trabajador-nombre">${nombres} ${apellidos}</h3>
                <p class="calculadora-trabajador-detalle">${area} - S/ ${sueldo.toLocaleString('es-PE')}</p>
            </div>
            
            <!-- Contenido en filas -->
            <div class="calculadora-trabajador-content">
                
                <!-- Fila Superior: 4 Columnas (Ingresos, Descuentos, Aportes Trabajador, Aportes Empleador) -->
                <div class="calculadora-conceptos-fila">
                    
                    <!-- Columna 1: Ingresos -->
                    <div class="calculadora-columna-concepto">
                        <div class="calculadora-seccion">
                            <h4 class="calculadora-seccion-titulo">Ingresos</h4>
                            <div class="calculadora-conceptos-lista" data-tipo="ingresos">
                                <!-- Sueldo Básico siempre presente -->
                                <div class="calculadora-concepto-item calculadora-concepto-fijo" data-concepto="sueldo_basico">
                                    <span class="calculadora-concepto-nombre">Sueldo Base</span>
                                    <span class="calculadora-concepto-monto">S/ ${sueldo.toLocaleString('es-PE')}</span>
                                </div>
                                <!-- Conceptos dinámicos de ingresos -->
                                ${ingresosHTML}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Columna 2: Descuentos -->
                    <div class="calculadora-columna-concepto">
                        <div class="calculadora-seccion">
                            <h4 class="calculadora-seccion-titulo">Descuentos</h4>
                            <div class="calculadora-conceptos-lista" data-tipo="descuentos">
                                
                            </div>
                        </div>
                    </div>
                    
                    <!-- Columna 3: Aportes Trabajador -->
                    <div class="calculadora-columna-concepto">
                        <div class="calculadora-seccion">
                            <h4 class="calculadora-seccion-titulo">Aportes Trabajador</h4>
                            <div class="calculadora-conceptos-lista" data-tipo="aportes-trabajador">
                                ${aportesHTML}
                            </div>
                        </div>
                    </div>
                    <!-- Columna 4: Aportes Empleador -->
                    <div class="calculadora-columna-concepto">
                        <div class="calculadora-seccion">
                            <h4 class="calculadora-seccion-titulo">Aportes Empleador</h4>
                            <div class="calculadora-conceptos-lista" data-tipo="aportes-empleador">
                                ${aportesEmpleadorHTML}
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Fila Inferior: Asistencia y Horas -->
                <div class="calculadora-asistencia-fila">
                    <div class="calculadora-seccion">
                        <h4 class="calculadora-seccion-titulo">Asistencia y Horas</h4>
                        
                        <div class="calculadora-asistencia-grid">
                            <div class="calculadora-asistencia-columna-campos">
                                <div class="calculadora-campo">
                                    <label class="calculadora-label">Días Laborados</label>
                                    <input type="number" class="calculadora-input" value="30" min="0" max="31" data-trabajador="${trabajador.id_trabajador}" data-campo="dias_laborados">
                                </div>
                                
                                <div class="calculadora-campo">
                                    <label class="calculadora-label">Horas Extras 25%</label>
                                    <input type="number" class="calculadora-input" value="0" min="0" step="0.5" data-trabajador="${trabajador.id_trabajador}" data-campo="horas_extras_25">
                                </div>
                                
                                <div class="calculadora-campo">
                                    <label class="calculadora-label">Horas Extras 35%</label>
                                    <input type="number" class="calculadora-input" value="0" min="0" step="0.5" data-trabajador="${trabajador.id_trabajador}" data-campo="horas_extras_35">
                                </div>
                                
                                <div class="calculadora-campo">
                                    <label class="calculadora-label">Faltas</label>
                                    <input type="number" class="calculadora-input" value="0" min="0" max="31" data-trabajador="${trabajador.id_trabajador}" data-campo="faltas">
                                </div>
                            </div>
                            
                            <div class="calculadora-neto-columna">
                                <div class="calculadora-campo calculadora-neto">
                                    <label class="calculadora-label">Neto a Pagar</label>
                                    <div class="calculadora-neto-valor" 
                                         id="neto-${trabajador.id_trabajador}"
                                         data-neto="${neto}"
                                         data-ingresos="${totalIngresos}"
                                         data-aportes="${totalAportes}">
                                        S/ ${netoMostrar}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        `;
        
        return seccion;
    }

    // Función específica para generar HTML de conceptos de ingresos
    async function generarConceptosIngresosHTML(conceptos, trabajador) {
        if (!conceptos || conceptos.length === 0) {
            return `
                <div class="calculadora-concepto-item calculadora-concepto-vacio">
                    <span class="calculadora-concepto-nombre">Sin conceptos adicionales</span>
                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                </div>
            `;
        }
        
        // Obtener RMV para cálculos de asignación familiar
        let rmvData = null;
        try {
            rmvData = await window.electronAPI.obtenerRMV();
        } catch (error) {
            console.warn('[PlanillasManager] Error obteniendo RMV:', error);
            rmvData = { valor: 1130.00, esRespaldo: true, mensaje: 'RMV de respaldo' };
        }
        
        return conceptos.map(concepto => {
            let montoCalculado = 0;
            let montoMostrar = '0.00';
            let mensajeAdicional = '';
            
            if (concepto.tipo_calculo === 'monto-fijo') {
                montoCalculado = parseFloat(concepto.valor);
                montoMostrar = montoCalculado.toFixed(2);
            } else if (concepto.tipo_calculo === 'porcentaje') {
                // Verificar si es Asignación Familiar (ID 6)
                if (concepto.id_concepto === 6) {
                    // Calcular con RMV: RMV × 10%
                    montoCalculado = (rmvData.valor * parseFloat(concepto.valor)) / 100;
                    montoMostrar = montoCalculado.toFixed(2);
                    
                    // Agregar mensaje de respaldo si es necesario
                    if (rmvData.esRespaldo && rmvData.mensaje) {
                        mensajeAdicional = `<br><small style="color: #f39c12; font-style: italic;">${rmvData.mensaje}</small>`;
                    }
                } else {
                    // Calcular porcentaje sobre el sueldo básico (comportamiento normal)
                    const sueldoBasico = parseFloat(trabajador.sueldo);
                    montoCalculado = (sueldoBasico * parseFloat(concepto.valor)) / 100;
                    montoMostrar = montoCalculado.toFixed(2);
                }
            }
            
            return `
                <div class="calculadora-concepto-item calculadora-concepto-dinamico" 
                     data-concepto-id="${concepto.id_concepto}" 
                     data-tipo-calculo="${concepto.tipo_calculo}" 
                     data-valor="${concepto.valor}"
                     data-monto-calculado="${montoCalculado}">
                    <span class="calculadora-concepto-nombre">${concepto.nombre}${mensajeAdicional}</span>
                    <span class="calculadora-concepto-monto">S/ ${montoMostrar}</span>
                </div>
            `;
        }).join('');
    }

    // Función para generar HTML de aportes del trabajador
    function generarAportesHTML(aportes) {
        if (!aportes || aportes.length === 0) {
            return `
                <div class="calculadora-concepto-item calculadora-concepto-vacio">
                    <span class="calculadora-concepto-nombre">Sin aportes calculados</span>
                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                </div>
            `;
        }
        
        return aportes.map(aporte => {
            const montoFormateado = parseFloat(aporte.monto).toFixed(2);
            
            return `
                <div class="calculadora-concepto-item calculadora-concepto-aporte" 
                     data-concepto="${aporte.concepto}" 
                     data-porcentaje="${aporte.porcentaje}"
                     data-monto="${aporte.monto}"
                     data-base-calculo="${aporte.base_calculo}">
                    <span class="calculadora-concepto-nombre">${aporte.concepto} (${aporte.porcentaje}%)</span>
                    <span class="calculadora-concepto-monto">S/ ${montoFormateado}</span>
                </div>
            `;
        }).join('');
    }

    // Función para generar HTML de aportes del empleador
    function generarAportesEmpleadorHTML(conceptosEmpleador, trabajador) {
        if (!conceptosEmpleador || conceptosEmpleador.length === 0) {
            return `
                <div class="calculadora-concepto-item calculadora-concepto-vacio">
                    <span class="calculadora-concepto-nombre">Sin aportes del empleador</span>
                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                </div>
            `;
        }
        
        return conceptosEmpleador.map(concepto => {
            let montoCalculado = 0;
            let montoMostrar = '0.00';
            
            // Calcular la base remunerativa (sueldo + conceptos remunerativos)
            let baseRemunerativa = parseFloat(trabajador.sueldo) || 0;
            // TODO: Aquí se podría agregar conceptos remunerativos adicionales si es necesario
            
            // Calcular el monto según el tipo de cálculo
            if (concepto.tipo_calculo === 'monto-fijo') {
                montoCalculado = parseFloat(concepto.valor) || 0;
            } else if (concepto.tipo_calculo === 'porcentaje') {
                montoCalculado = (baseRemunerativa * parseFloat(concepto.valor)) / 100;
            }
            
            montoMostrar = montoCalculado.toFixed(2);
            
            return `
                <div class="calculadora-concepto-item calculadora-concepto-aporte concepto-aporte-empleador" 
                     data-concepto-id="${concepto.id_concepto}"
                     data-concepto="${concepto.nombre}" 
                     data-tipo-calculo="${concepto.tipo_calculo}"
                     data-valor="${concepto.valor}"
                     data-porcentaje="${concepto.valor}"
                     data-monto="${montoCalculado}"
                     data-base-calculo="${baseRemunerativa}">
                    <span class="calculadora-concepto-nombre">${concepto.nombre} (${concepto.valor}%)</span>
                    <span class="calculadora-concepto-monto">S/ ${montoMostrar}</span>
                </div>
            `;
        }).join('');
    }

    // Función para cargar conceptos de ingresos de un trabajador
    async function cargarConceptosIngresos(idTrabajador) {
        try {
            console.log(`[PlanillasManager] Cargando conceptos de ingresos para trabajador ${idTrabajador}`);
            
            const response = await window.electronAPI.invoke('get-trabajador-conceptos', idTrabajador, 'ingreso');
            
            if (response.success) {
                console.log(`[PlanillasManager] Conceptos de ingresos cargados:`, response.conceptos.length);
                return response.conceptos || [];
            } else {
                console.error('[PlanillasManager] Error cargando conceptos:', response.error);
                return [];
            }
        } catch (error) {
            console.error('[PlanillasManager] Error en cargarConceptosIngresos:', error);
            return [];
        }
    }

    // Función para cargar aportes calculados de un trabajador
    async function cargarAportesTrabajador(idTrabajador) {
        try {
            console.log(`[PlanillasManager] Calculando aportes para trabajador ${idTrabajador}`);
            
            const response = await window.electronAPI.invoke('get-trabajador-aportes', idTrabajador);
            
            if (response.success) {
                console.log(`[PlanillasManager] Aportes calculados:`, response.aportes?.length || 0);
                return response.aportes || [];
            } else {
                console.error('[PlanillasManager] Error calculando aportes:', response.error);
                return [];
            }
        } catch (error) {
            console.error('[PlanillasManager] Error en cargarAportesTrabajador:', error);
            return [];
        }
    }

    // Función para cargar aportes del empleador de un trabajador
    async function cargarAportesEmpleador(idTrabajador) {
        try {
            console.log(`[PlanillasManager] Obteniendo aportes del empleador para trabajador ${idTrabajador}`);
            
            const response = await window.electronAPI.invoke('get-aportes-empleador', idTrabajador);
            
            if (response.success) {
                console.log(`[PlanillasManager] Aportes del empleador obtenidos:`, response.conceptos?.length || 0);
                return response.conceptos || [];
            } else {
                console.error('[PlanillasManager] Error obteniendo aportes del empleador:', response.error);
                return [];
            }
        } catch (error) {
            console.error('[PlanillasManager] Error en cargarAportesEmpleador:', error);
            return [];
        }
    }

    // Función para generar HTML de conceptos dinámicos
    function generarConceptosHTML(conceptos, tipoSeccion) {
        if (!conceptos || conceptos.length === 0) {
            return `
                <div class="calculadora-concepto-item">
                    <span class="calculadora-concepto-nombre">No hay conceptos asignados</span>
                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                </div>
            `;
        }
        
        return conceptos.map(concepto => {
            // Calcular el monto basado en el tipo de cálculo
            let montoMostrar = '0.00';
            if (concepto.tipo_calculo === 'monto-fijo') {
                montoMostrar = parseFloat(concepto.valor).toFixed(2);
            } else {
                // Para porcentaje, se calculará dinámicamente
                montoMostrar = `${parseFloat(concepto.valor).toFixed(2)}%`;
            }
            
            return `
                <div class="calculadora-concepto-item" data-concepto-id="${concepto.id_concepto}" data-tipo-calculo="${concepto.tipo_calculo}" data-valor="${concepto.valor}">
                    <span class="calculadora-concepto-nombre">${concepto.nombre}</span>
                    <span class="calculadora-concepto-monto">S/ ${montoMostrar}</span>
                </div>
            `;
        }).join('');
    }

    // Función para configurar navegación entre interfaces
    function configurarNavegacionCalculadora() {
        const navButtons = document.querySelectorAll('.calculadora-nav-btn');
        const interfaces = document.querySelectorAll('.calculadora-interface');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // No permitir acceso a vista previa si está bloqueada
                if (this.classList.contains('disabled')) {
                    return;
                }
                
                const targetInterface = this.dataset.interface;
                
                // Cambiar botón activo
                navButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Cambiar interfaz activa
                interfaces.forEach(interfaz => interfaz.classList.remove('active'));
                const targetInterfaceElement = document.getElementById(`interfaz${targetInterface.charAt(0).toUpperCase() + targetInterface.slice(1).replace('-', '')}`);
                if (targetInterfaceElement) {
                    targetInterfaceElement.classList.add('active');
                }
                
                // Si está cambiando a vista previa y ya había sido calculada, restaurar los datos
                if (targetInterface === 'vista-previa' && vistaPreviaCalculada && datosVistaPreviaGuardados) {
                    restaurarVistaPrevia();
                }
                
                console.log('[PlanillasManager] Cambiado a interfaz:', targetInterface);
            });
        });
        
        // Configurar botones del footer
        const btnCancelar = document.getElementById('btnCancelarCalculadora');
        const btnGuardar = document.getElementById('btnGuardarCalculadora');
        const btnCalcular = document.getElementById('btnCalcularPlanilla');
        
        if (btnCancelar) {
            btnCancelar.addEventListener('click', function(e) {
                e.preventDefault();
                cerrarModalCalculadora();
            });
        }
        
        if (btnGuardar) {
            btnGuardar.addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('[PlanillasManager] Guardando planilla calculada');
                
                if (!planillaActualId) {
                    alert('Error: No se ha identificado la planilla a guardar');
                    return;
                }
                
                try {
                    // Deshabilitar botón para evitar doble click
                    btnGuardar.disabled = true;
                    btnGuardar.textContent = 'Guardando...';
                    
                    // Recopilar todos los datos calculados
                    const datosCalculados = recopilarDatosCalculados();
                    
                    if (!datosCalculados) {
                        throw new Error('No hay datos calculados para guardar');
                    }
                    
                    console.log('[PlanillasManager] Guardando cálculos:', {
                        planillaId: planillaActualId,
                        trabajadores: datosCalculados.trabajadores?.length,
                        totales: datosCalculados.totalesPlanilla
                    });
                    
                    // Guardar en la base de datos
                    const response = await window.electronAPI.guardarCalculosPlanilla(planillaActualId, datosCalculados);
                    
                    if (response.success) {
                        console.log('[PlanillasManager] Planilla guardada exitosamente');
                        
                        // Mostrar mensaje de éxito
                        alert('Planilla guardada exitosamente');
                        
                        // Cerrar modal
                        cerrarModalCalculadora();
                        
                        // Recargar lista de planillas
                        await cargarPlanillas();
                        
                        // Limpiar variable
                        planillaActualId = null;
                        
                    } else {
                        throw new Error(response.error || 'Error guardando la planilla');
                    }
                    
                } catch (error) {
                    console.error('[PlanillasManager] Error guardando planilla:', error);
                    alert('Error al guardar la planilla: ' + error.message);
                } finally {
                    // Rehabilitar botón
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = 'Guardar Planilla Calculada';
                }
            });
        }
        
        if (btnCalcular) {
            btnCalcular.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[PlanillasManager] Botón Calcular Planilla presionado');
                
                // Recalcular todos los netos y totales
                recalcularTodosPlanilla();
                
                // Habilitar vista previa
                habilitarVistaPrevia();
                
                // Mostrar mensaje de éxito
                console.log('[PlanillasManager] Planilla recalculada exitosamente');
            });
        }
    }

    // Función para cerrar modal calculadora
    function cerrarModalCalculadora() {
        console.log('[PlanillasManager] Cerrando modal calculadora');
        const modal = document.getElementById('modalCalculadoraPlanilla');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll del body
            
            // Limpiar datos de la planilla actual si no se guardó
            // planillaActualId = null; // Comentado para mantener el estado
        } else {
            console.error('[PlanillasManager] Modal calculadora no encontrado para cerrar');
        }
        
        console.log('[PlanillasManager] Modal calculadora cerrado');
    }

    // Función para habilitar vista previa
    function habilitarVistaPrevia() {
        try {
            console.log('[PlanillasManager] Habilitando vista previa...');
            
            // Habilitar botón de navegación
            const btnVistaPrevia = document.getElementById('btnVistaPrevia');
            if (btnVistaPrevia) {
                btnVistaPrevia.classList.remove('disabled');
            }
            
            // Ocultar estado bloqueado y mostrar contenido
            const vistaBloqueada = document.getElementById('vistaPreviaBloqueado');
            const vistaDesbloqueada = document.getElementById('vistaPreviewDesbloqueado');
            
            if (vistaBloqueada) {
                vistaBloqueada.style.display = 'none';
            }
            
            if (vistaDesbloqueada) {
                vistaDesbloqueada.style.display = 'block';
            }
            
            // Guardar datos calculados antes de llenar vista previa
            guardarDatosVistaPrevia();
            
            // Llenar datos de la vista previa
            llenarVistaPrevia();
            
            // Cambiar automáticamente a la vista previa
            cambiarAVistaPrevia();
            
            console.log('[PlanillasManager] Vista previa habilitada exitosamente');
        } catch (error) {
            console.error('[PlanillasManager] Error habilitando vista previa:', error);
        }
    }

    // Función para cambiar automáticamente a la vista previa
    function cambiarAVistaPrevia() {
        try {
            // Desactivar todos los botones de navegación
            const navButtons = document.querySelectorAll('.calculadora-nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activar botón de vista previa
            const btnVistaPrevia = document.getElementById('btnVistaPrevia');
            if (btnVistaPrevia) {
                btnVistaPrevia.classList.add('active');
            }
            
            // Ocultar todas las interfaces
            const interfaces = document.querySelectorAll('.calculadora-interface');
            interfaces.forEach(interfaz => interfaz.classList.remove('active'));
            
            // Mostrar interfaz de vista previa
            const interfazVistaPrevia = document.getElementById('interfazVistaPrevia');
            if (interfazVistaPrevia) {
                interfazVistaPrevia.classList.add('active');
            }
            
            console.log('[PlanillasManager] Cambiado automáticamente a vista previa');
        } catch (error) {
            console.error('[PlanillasManager] Error cambiando a vista previa:', error);
        }
    }

    // Función para guardar los datos calculados de vista previa
    function guardarDatosVistaPrevia() {
        try {
            console.log('[PlanillasManager] Guardando datos de vista previa...');
            
            // Recopilar todos los datos calculados
            const datos = recopilarDatosCalculados();
            
            if (datos && datos.trabajadores && datos.trabajadores.length > 0) {
                datosVistaPreviaGuardados = JSON.parse(JSON.stringify(datos)); // Copia profunda
                vistaPreviaCalculada = true;
                console.log('[PlanillasManager] Datos de vista previa guardados exitosamente');
            } else {
                console.warn('[PlanillasManager] No hay datos calculados para guardar en vista previa');
            }
        } catch (error) {
            console.error('[PlanillasManager] Error guardando datos de vista previa:', error);
        }
    }

    // Función para restaurar vista previa desde datos guardados
    function restaurarVistaPrevia() {
        try {
            console.log('[PlanillasManager] Restaurando vista previa...');
            
            if (vistaPreviaCalculada && datosVistaPreviaGuardados) {
                // Cambiar a vista previa
                cambiarAVistaPrevia();
                
                // Habilitar botón de vista previa
                const btnVistaPrevia = document.getElementById('btnVistaPrevia');
                if (btnVistaPrevia) {
                    btnVistaPrevia.classList.remove('disabled');
                }
                
                // Llenar datos de vista previa con datos guardados
                llenarVistaPreviaConDatos(datosVistaPreviaGuardados);
                
                console.log('[PlanillasManager] Vista previa restaurada exitosamente');
            } else {
                console.warn('[PlanillasManager] No hay datos de vista previa para restaurar');
            }
        } catch (error) {
            console.error('[PlanillasManager] Error restaurando vista previa:', error);
        }
    }

    // Función para llenar datos de la vista previa
    function llenarVistaPrevia() {
        try {
            console.log('[PlanillasManager] Llenando datos de vista previa...');
            
            const contenedor = document.getElementById('vistaPreviaContenido');
            if (!contenedor) {
                console.error('[PlanillasManager] Contenedor de vista previa no encontrado');
                return;
            }
            
            // Limpiar contenido previo
            contenedor.innerHTML = '';
            
            // Obtener datos de todos los trabajadores
            const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
            
            seccionesTrabajadores.forEach(seccion => {
                const trabajadorId = seccion.dataset.trabajadorId;
                const nombreElement = seccion.querySelector('.calculadora-trabajador-nombre');
                const netoElement = document.getElementById(`neto-${trabajadorId}`);
                
                if (!nombreElement || !netoElement) {
                    return;
                }
                
                const nombre = nombreElement.textContent.trim();
                const ingresos = parseFloat(netoElement.dataset.ingresos) || 0;
                const descuentos = parseFloat(netoElement.dataset.descuentos) || 0;
                const aportes = parseFloat(netoElement.dataset.aportes) || 0;
                const neto = parseFloat(netoElement.dataset.neto) || 0;
                
                // Crear fila para el trabajador
                const fila = document.createElement('div');
                fila.className = 'vista-previa-fila';
                fila.innerHTML = `
                    <div class="vista-previa-celda">${nombre}</div>
                    <div class="vista-previa-celda">S/ ${ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${descuentos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${aportes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                `;
                
                contenedor.appendChild(fila);
            });
            
            console.log('[PlanillasManager] Vista previa llenada con', seccionesTrabajadores.length, 'trabajadores');
        } catch (error) {
            console.error('[PlanillasManager] Error llenando vista previa:', error);
        }
    }

    // Función para llenar vista previa con datos específicos (usado en restauración)
    function llenarVistaPreviaConDatos(datosGuardados) {
        try {
            console.log('[PlanillasManager] Llenando vista previa con datos guardados...');
            
            const contenedor = document.getElementById('vistaPreviaContenido');
            if (!contenedor) {
                console.error('[PlanillasManager] Contenedor de vista previa no encontrado');
                return;
            }
            
            // Limpiar contenido previo
            contenedor.innerHTML = '';
            
            // Verificar si hay trabajadores en los datos guardados
            if (!datosGuardados || !datosGuardados.trabajadores || !Array.isArray(datosGuardados.trabajadores)) {
                console.warn('[PlanillasManager] No hay trabajadores en los datos guardados');
                return;
            }
            
            // Llenar con los datos guardados
            datosGuardados.trabajadores.forEach(trabajador => {
                if (!trabajador || !trabajador.nombre) {
                    return;
                }
                
                const ingresos = parseFloat(trabajador.totalIngresos) || 0;
                const descuentos = parseFloat(trabajador.totalDescuentos) || 0;
                const aportes = parseFloat(trabajador.totalAportes) || 0;
                const neto = parseFloat(trabajador.sueldoNeto) || 0;
                
                // Crear fila para el trabajador
                const fila = document.createElement('div');
                fila.className = 'vista-previa-fila';
                fila.innerHTML = `
                    <div class="vista-previa-celda">${trabajador.nombre}</div>
                    <div class="vista-previa-celda">S/ ${ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${descuentos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${aportes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="vista-previa-celda">S/ ${neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                `;
                
                contenedor.appendChild(fila);
            });
            
            console.log('[PlanillasManager] Vista previa llenada con', datosGuardados.trabajadores.length, 'trabajadores desde datos guardados');
            
            // Mostrar el contenido desbloqueado
            const vistaBloqueada = document.getElementById('vistaPreviaBloqueado');
            const vistaDesbloqueada = document.getElementById('vistaPreviewDesbloqueado');
            
            if (vistaBloqueada) {
                vistaBloqueada.style.display = 'none';
            }
            
            if (vistaDesbloqueada) {
                vistaDesbloqueada.style.display = 'block';
            }
            
        } catch (error) {
            console.error('[PlanillasManager] Error llenando vista previa con datos guardados:', error);
        }
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
        
        // CARGA INICIAL AUTOMÁTICA DE PLANILLAS
        cargarDatosIniciales();
        
        // Configurar filtros de la tabla
        configurarFiltrosPlanillas();
        
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
        
        // Botón recargar planillas
        const btnRecargar = document.getElementById('btnRecargar');
        if (btnRecargar) {
            btnRecargar.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[PlanillasManager] Recargando planillas manualmente');
                await cargarDatosIniciales();
            });
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
        
        // Botón crear planilla
        const btnCrearPlanilla = document.getElementById('btnCrearPlanilla');
        if (btnCrearPlanilla) {
            btnCrearPlanilla.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[PlanillasManager] Botón crear planilla clickeado');
                
                // Validar que haya trabajadores seleccionados
                const trabajadoresSeleccionados = obtenerTrabajadoresSeleccionados();
                if (trabajadoresSeleccionados.length === 0) {
                    alert('Debe seleccionar al menos un trabajador para crear la planilla.');
                    return;
                }
                
                // Obtener datos del formulario
                const datosFormulario = obtenerDatosFormularioPlanilla();
                if (!datosFormulario) {
                    return; // Error en validación
                }
                
                try {
                    // Deshabilitar botón para evitar doble click
                    btnCrearPlanilla.disabled = true;
                    btnCrearPlanilla.textContent = 'Creando...';
                    
                    console.log('[PlanillasManager] Creando planilla con datos:', {
                        ...datosFormulario,
                        trabajadores: trabajadoresSeleccionados.length
                    });
                    
                    // Crear planilla en la base de datos
                    const response = await window.electronAPI.crearPlanilla({
                        ...datosFormulario,
                        trabajadoresSeleccionados
                    });
                    
                    if (response.success) {
                        console.log('[PlanillasManager] Planilla creada exitosamente:', response.id_planilla);
                        
                        // Guardar ID de planilla para uso posterior
                        planillaActualId = response.id_planilla;
                        
                        // Cerrar modal actual y abrir calculadora
                        cerrarModalPlanilla();
                        abrirModalCalculadora(trabajadoresSeleccionados, response.id_planilla);
                        
                        // Recargar lista de planillas
                        await cargarPlanillas();
                        
                    } else {
                        throw new Error(response.error || 'Error creando planilla');
                    }
                    
                } catch (error) {
                    console.error('[PlanillasManager] Error creando planilla:', error);
                    alert('Error al crear la planilla: ' + error.message);
                } finally {
                    // Rehabilitar botón
                    btnCrearPlanilla.disabled = false;
                    btnCrearPlanilla.textContent = 'Crear Planilla';
                }
            });
        }

        // Botón limpiar
        const btnLimpiar = document.querySelector('#modalCrearPlanilla .planilla-modal-limpiar-btn');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                limpiarSelecciones();
            });
        }
        
        // Configurar modal calculadora
        configurarModalCalculadora();
        
        // Configurar modal de detalle
        configurarModalDetallePlanilla();
        
        // Verificar funciones globales
        console.log('[PlanillasManager] Funciones globales disponibles:', {
            abrirCalculadoraPlanilla: typeof window.abrirCalculadoraPlanilla,
            abrirModalCalculadora: typeof window.abrirModalCalculadora,
            verDetallePlanilla: typeof window.verDetallePlanilla,
            cerrarModalDetalle: typeof window.cerrarModalDetalle,
            cerrarModalCalculadora: typeof window.cerrarModalCalculadora,
            mostrarMensajeTemporalInfo: typeof window.mostrarMensajeTemporalInfo
        });
        
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
        
        // Asegurar que se carguen los datos si no se han cargado aún
        if (planillasData.length === 0) {
            console.log('[PlanillasManager] Cargando datos como respaldo...');
            cargarDatosIniciales();
        }
    });
    
    // Función global para pruebas
    window.abrirModalPlanilla = abrirModalPlanilla;
    window.cerrarModalPlanilla = cerrarModalPlanilla;
    
    // Exponer funciones globalmente para uso en onclick
    window.abrirCalculadoraPlanilla = abrirCalculadoraPlanilla;
    window.abrirModalCalculadora = abrirModalCalculadora;
    window.verDetallePlanilla = verDetallePlanilla;
    window.mostrarMenuPlanilla = mostrarMenuPlanilla;
    window.cerrarModalDetalle = cerrarModalDetalle;
    window.cerrarModalCalculadora = cerrarModalCalculadora;
    window.mostrarMensajeTemporalInfo = mostrarMensajeTemporalInfo;
    
})();

// Event listener adicional para modal calculadora
document.addEventListener('DOMContentLoaded', function() {
    const modalCalculadora = document.getElementById('modalCalculadoraPlanilla');
    if (modalCalculadora) {
        modalCalculadora.addEventListener('click', function(e) {
            if (e.target === modalCalculadora) {
                // Verificar si existe la función antes de llamarla
                if (typeof cerrarModalCalculadora === 'function') {
                    cerrarModalCalculadora();
                }
            }
        });
    }
});

    // Función para calcular el neto a pagar de un trabajador específico
    function calcularNetoTrabajador(trabajadorId, conceptosIngresos, aportesTrabajador) {
        try {
            // 1. Calcular total de ingresos desde el DOM
            let totalIngresos = 0;
            
            // Obtener sueldo básico del DOM
            const seccionTrabajador = document.querySelector(`[data-trabajador-id="${trabajadorId}"]`);
            if (seccionTrabajador) {
                // Sueldo básico
                const sueldoBasicoElement = seccionTrabajador.querySelector('[data-concepto="sueldo_basico"] .calculadora-concepto-monto');
                if (sueldoBasicoElement) {
                    const sueldoTexto = sueldoBasicoElement.textContent.replace('S/', '').replace(',', '').trim();
                    totalIngresos += parseFloat(sueldoTexto) || 0;
                }
                
                // Sumar conceptos de ingresos dinámicos
                if (conceptosIngresos && Array.isArray(conceptosIngresos)) {
                    conceptosIngresos.forEach(concepto => {
                        const montoCalculado = parseFloat(concepto.monto_calculado) || 0;
                        totalIngresos += montoCalculado;
                    });
                }
                
                // Sumar horas extras calculadas desde el DOM
                const horasExtras = seccionTrabajador.querySelectorAll('.calculadora-concepto-calculado .calculadora-concepto-monto');
                horasExtras.forEach(extra => {
                    const montoTexto = extra.textContent.replace('S/', '').replace(',', '').trim();
                    const monto = parseFloat(montoTexto) || 0;
                    totalIngresos += monto;
                });
            }
            
            // 2. Calcular total de descuentos desde el DOM
            let totalDescuentos = 0;
            if (seccionTrabajador) {
                const descuentos = seccionTrabajador.querySelectorAll('.calculadora-conceptos-lista[data-tipo="descuentos"] .calculadora-concepto-item .calculadora-concepto-monto');
                descuentos.forEach(descuento => {
                    const montoTexto = descuento.textContent.replace('S/', '').replace(',', '').trim();
                    const monto = parseFloat(montoTexto) || 0;
                    totalDescuentos += monto;
                });
            }
            
            // 3. Calcular total de aportes del trabajador
            let totalAportes = 0;
            if (aportesTrabajador && Array.isArray(aportesTrabajador)) {
                aportesTrabajador.forEach(aporte => {
                    totalAportes += parseFloat(aporte.monto) || 0;
                });
            }
            
            // 4. Calcular neto (Ingresos - Descuentos - Aportes)
            const neto = totalIngresos - totalDescuentos - totalAportes;
            
            console.log(`[PlanillasManager] Cálculo neto trabajador ${trabajadorId}:`, {
                totalIngresos,
                totalDescuentos,
                totalAportes,
                neto
            });
            
            return {
                totalIngresos: totalIngresos || 0,
                totalDescuentos: totalDescuentos || 0,
                totalAportes: totalAportes || 0,
                neto: neto || 0
            };
        } catch (error) {
            console.error('[PlanillasManager] Error calculando neto del trabajador:', error);
            return { totalIngresos: 0, totalDescuentos: 0, totalAportes: 0, neto: 0 };
        }
    }// Función para actualizar el neto a pagar en el DOM
function actualizarNetoTrabajador(trabajadorId, calculosNeto) {
    const netoElement = document.getElementById(`neto-${trabajadorId}`);
    if (netoElement) {
        netoElement.textContent = `S/ ${calculosNeto.neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        netoElement.dataset.neto = calculosNeto.neto;
        netoElement.dataset.ingresos = calculosNeto.totalIngresos;
        netoElement.dataset.descuentos = calculosNeto.totalDescuentos || 0;
        netoElement.dataset.aportes = calculosNeto.totalAportes;
    }
}

// Función para calcular y actualizar totales en las tarjetas de resumen
function actualizarTarjetasResumen() {
    try {
        let totalIngresosPlanilla = 0;
        let totalDescuentosPlanilla = 0;
        let totalAportesPlanilla = 0;
        let totalNetoPlanilla = 0;
        
        // Recorrer todos los trabajadores y sumar sus totales
        const netosElements = document.querySelectorAll('[id^="neto-"]');
        
        netosElements.forEach(netoElement => {
            const ingresos = parseFloat(netoElement.dataset.ingresos) || 0;
            const descuentos = parseFloat(netoElement.dataset.descuentos) || 0;
            const aportes = parseFloat(netoElement.dataset.aportes) || 0;
            const neto = parseFloat(netoElement.dataset.neto) || 0;
            
            totalIngresosPlanilla += ingresos;
            totalDescuentosPlanilla += descuentos;
            totalAportesPlanilla += aportes;
            totalNetoPlanilla += neto;
        });
        
        // Actualizar las tarjetas en el DOM
        const totalIngresosElement = document.getElementById('totalIngresos');
        const totalDescuentosElement = document.getElementById('totalDescuentos');
        const totalAportesElement = document.getElementById('totalAportes');
        const totalNetoElement = document.getElementById('totalNeto');
        
        if (totalIngresosElement) {
            totalIngresosElement.textContent = `S/ ${totalIngresosPlanilla.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        if (totalDescuentosElement) {
            totalDescuentosElement.textContent = `S/ ${totalDescuentosPlanilla.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        if (totalAportesElement) {
            totalAportesElement.textContent = `S/ ${totalAportesPlanilla.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        if (totalNetoElement) {
            totalNetoElement.textContent = `S/ ${totalNetoPlanilla.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        console.log('[PlanillasManager] Totales de planilla actualizados:', {
            totalIngresosPlanilla,
            totalDescuentosPlanilla,
            totalAportesPlanilla,
            totalNetoPlanilla
        });
        
    } catch (error) {
        console.error('[PlanillasManager] Error actualizando tarjetas de resumen:', error);
    }
}

// Función para recalcular toda la planilla
function recalcularTodosPlanilla() {
    try {
        console.log('[PlanillasManager] Iniciando recálculo de toda la planilla...');
        
        // Recalcular cada trabajador
        const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
        
        seccionesTrabajadores.forEach(seccion => {
            const trabajadorId = seccion.dataset.trabajadorId;
            console.log(`[PlanillasManager] Recalculando trabajador ${trabajadorId}`);
            
            // 1. CALCULAR DESCUENTOS POR FALTAS
            calcularDescuentosPorFaltas(seccion, trabajadorId);
            
            // 2. CALCULAR HORAS EXTRAS
            calcularHorasExtras(seccion, trabajadorId);
            
            // 3. Obtener conceptos de ingresos dinámicos del DOM
            const conceptosIngresos = [];
            const conceptosDinamicos = seccion.querySelectorAll('.calculadora-concepto-dinamico');
            conceptosDinamicos.forEach(concepto => {
                conceptosIngresos.push({
                    id_concepto: concepto.dataset.conceptoId,
                    monto_calculado: parseFloat(concepto.dataset.montoCalculado) || 0
                });
            });
            
            // 4. Obtener aportes del trabajador del DOM (NO incluir aportes del empleador)
            const aportesTrabajador = [];
            const conceptosAportes = seccion.querySelectorAll('.calculadora-conceptos-lista[data-tipo="aportes-trabajador"] .calculadora-concepto-aporte');
            conceptosAportes.forEach(aporte => {
                aportesTrabajador.push({
                    concepto: aporte.dataset.concepto,
                    monto: parseFloat(aporte.dataset.monto) || 0
                });
            });
            
            // 5. Recalcular el neto del trabajador
            const calculosNeto = calcularNetoTrabajador(trabajadorId, conceptosIngresos, aportesTrabajador);
            actualizarNetoTrabajador(trabajadorId, calculosNeto);
        });
        
        // Actualizar tarjetas de resumen
        actualizarTarjetasResumen();
        
        // Actualizar resumen por conceptos
        actualizarResumenPorConceptos();
        
        console.log('[PlanillasManager] Recálculo de planilla completado');
        
    } catch (error) {
        console.error('[PlanillasManager] Error recalculando planilla:', error);
    }
}

// Función para calcular descuentos por faltas
function calcularDescuentosPorFaltas(seccionTrabajador, trabajadorId) {
    try {
        // Limpiar descuentos previos 
        limpiarDescuentosEnSeccion(seccionTrabajador);
        
        // Obtener el input de faltas
        const inputFaltas = seccionTrabajador.querySelector(`input[data-campo="faltas"][data-trabajador="${trabajadorId}"]`);
        const faltas = parseFloat(inputFaltas?.value) || 0;
        
        if (faltas <= 0) {
            return;
        }
        
        // Obtener el sueldo básico del trabajador
        const sueldoElement = seccionTrabajador.querySelector('.calculadora-concepto-fijo[data-concepto="sueldo_basico"] .calculadora-concepto-monto');
        const sueldoTexto = sueldoElement?.textContent || 'S/ 0';
        const sueldo = parseFloat(sueldoTexto.replace('S/', '').replace(',', '').trim()) || 0;
        
        // Calcular descuento por faltas: (sueldo ÷ 30) × días de falta
        const valorDiario = sueldo / 30;
        const descuentoFaltas = valorDiario * faltas;
        
        console.log(`[PlanillasManager] Trabajador ${trabajadorId} - Faltas: ${faltas}, Sueldo: ${sueldo}, Descuento: ${descuentoFaltas}`);
        
        // Actualizar la sección de descuentos
        actualizarDescuentoEnSeccion(seccionTrabajador, 'Faltas', descuentoFaltas);
        
    } catch (error) {
        console.error(`[PlanillasManager] Error calculando faltas para trabajador ${trabajadorId}:`, error);
    }
}

// Función para calcular horas extras
function calcularHorasExtras(seccionTrabajador, trabajadorId) {
    try {
        // Obtener los inputs de horas extras
        const inputHoras25 = seccionTrabajador.querySelector(`input[data-campo="horas_extras_25"][data-trabajador="${trabajadorId}"]`);
        const inputHoras35 = seccionTrabajador.querySelector(`input[data-campo="horas_extras_35"][data-trabajador="${trabajadorId}"]`);
        
        const horas25 = parseFloat(inputHoras25?.value) || 0;
        const horas35 = parseFloat(inputHoras35?.value) || 0;
        
        // Obtener el sueldo básico del trabajador
        const sueldoElement = seccionTrabajador.querySelector('.calculadora-concepto-fijo[data-concepto="sueldo_basico"] .calculadora-concepto-monto');
        const sueldoTexto = sueldoElement?.textContent || 'S/ 0';
        const sueldo = parseFloat(sueldoTexto.replace('S/', '').replace(',', '').trim()) || 0;
        
        // Calcular valor hora: (sueldo ÷ 30 días ÷ 8 horas)
        const valorHora = sueldo / 30 / 8;
        
        // Calcular horas extras
        const montoHoras25 = horas25 * valorHora * 1.25; // 25% adicional
        const montoHoras35 = horas35 * valorHora * 1.35; // 35% adicional
        
        console.log(`[PlanillasManager] Trabajador ${trabajadorId} - H.E. 25%: ${horas25}h = S/${montoHoras25.toFixed(2)}, H.E. 35%: ${horas35}h = S/${montoHoras35.toFixed(2)}`);
        
        // Actualizar la sección de ingresos con horas extras
        if (montoHoras25 > 0) {
            actualizarIngresoEnSeccion(seccionTrabajador, 'Horas Extras 25%', montoHoras25);
        }
        
        if (montoHoras35 > 0) {
            actualizarIngresoEnSeccion(seccionTrabajador, 'Horas Extras 35%', montoHoras35);
        }
        
        // Si no hay horas extras, limpiar los conceptos
        if (montoHoras25 <= 0) {
            removerIngresoEnSeccion(seccionTrabajador, 'Horas Extras 25%');
        }
        if (montoHoras35 <= 0) {
            removerIngresoEnSeccion(seccionTrabajador, 'Horas Extras 35%');
        }
        
    } catch (error) {
        console.error(`[PlanillasManager] Error calculando horas extras para trabajador ${trabajadorId}:`, error);
    }
}

// Función para recalcular aportes del empleador (incluye horas extras)
function recalcularAportesEmpleador(seccionTrabajador, trabajadorId) {
    try {
        // 1. Obtener el sueldo básico
        const sueldoElement = seccionTrabajador.querySelector('.calculadora-concepto-fijo[data-concepto="sueldo_basico"] .calculadora-concepto-monto');
        const sueldoTexto = sueldoElement?.textContent || 'S/ 0';
        let totalRemunerativo = parseFloat(sueldoTexto.replace('S/', '').replace(',', '').trim()) || 0;
        
        // 2. Sumar conceptos dinámicos remunerativos
        const conceptosDinamicos = seccionTrabajador.querySelectorAll('.calculadora-concepto-dinamico');
        conceptosDinamicos.forEach(concepto => {
            const monto = parseFloat(concepto.dataset.montoCalculado) || 0;
            totalRemunerativo += monto;
        });
        
        // 3. Sumar horas extras calculadas (son remunerativas)
        const horasExtras = seccionTrabajador.querySelectorAll('.calculadora-concepto-item[data-ingreso]');
        horasExtras.forEach(extra => {
            const montoTexto = extra.querySelector('.calculadora-concepto-monto')?.textContent || 'S/ 0';
            const monto = parseFloat(montoTexto.replace('S/', '').replace(',', '').trim()) || 0;
            totalRemunerativo += monto;
        });
        
        console.log(`[PlanillasManager] Total remunerativo para aportes empleador trabajador ${trabajadorId}: S/ ${totalRemunerativo}`);
        
        // 4. Recalcular todos los aportes del empleador basados en conceptos de la BD
        const aportesEmpleador = seccionTrabajador.querySelectorAll('.calculadora-conceptos-lista[data-tipo="aportes-empleador"] .calculadora-concepto-aporte');
        
        aportesEmpleador.forEach(aporteElement => {
            const conceptoNombre = aporteElement.dataset.concepto || aporteElement.querySelector('.calculadora-concepto-nombre')?.textContent.split(' (')[0];
            const tipoCalculo = aporteElement.dataset.tipoCalculo || 'porcentaje';
            const valor = parseFloat(aporteElement.dataset.valor || aporteElement.dataset.porcentaje) || 0;
            
            let montoCalculado = 0;
            
            if (tipoCalculo === 'monto-fijo') {
                montoCalculado = valor;
            } else if (tipoCalculo === 'porcentaje') {
                montoCalculado = (totalRemunerativo * valor) / 100;
            }
            
            // Actualizar el elemento en el DOM
            actualizarAporteEmpleadorEnSeccion(seccionTrabajador, conceptoNombre, valor, montoCalculado, totalRemunerativo);
        });
        
    } catch (error) {
        console.error(`[PlanillasManager] Error recalculando aportes del empleador para trabajador ${trabajadorId}:`, error);
    }
}

// Función para actualizar descuentos en la sección
function actualizarDescuentoEnSeccion(seccionTrabajador, nombreDescuento, monto) {
    const listaDescuentos = seccionTrabajador.querySelector('.calculadora-conceptos-lista[data-tipo="descuentos"]');
    
    if (!listaDescuentos) return;
    
    // Buscar si ya existe el descuento
    let itemDescuento = listaDescuentos.querySelector(`.calculadora-concepto-item[data-descuento="${nombreDescuento}"]`);
    
    if (monto > 0) {
        if (!itemDescuento) {
            // Crear nuevo item de descuento
            itemDescuento = document.createElement('div');
            itemDescuento.className = 'calculadora-concepto-item';
            itemDescuento.setAttribute('data-descuento', nombreDescuento);
            listaDescuentos.appendChild(itemDescuento);
        }
        
        // Actualizar contenido
        itemDescuento.innerHTML = `
            <span class="calculadora-concepto-nombre">${nombreDescuento}</span>
            <span class="calculadora-concepto-monto">S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
    } else {
        // Si el monto es 0, remover el item
        if (itemDescuento) {
            itemDescuento.remove();
        }
    }
}

// Función para actualizar ingresos en la sección  
function actualizarIngresoEnSeccion(seccionTrabajador, nombreIngreso, monto) {
    const listaIngresos = seccionTrabajador.querySelector('.calculadora-conceptos-lista[data-tipo="ingresos"]');
    
    if (!listaIngresos) return;
    
    // Buscar si ya existe el ingreso
    let itemIngreso = listaIngresos.querySelector(`.calculadora-concepto-item[data-ingreso="${nombreIngreso}"]`);
    
    if (!itemIngreso) {
        // Crear nuevo item de ingreso
        itemIngreso = document.createElement('div');
        itemIngreso.className = 'calculadora-concepto-item calculadora-concepto-calculado';
        itemIngreso.setAttribute('data-ingreso', nombreIngreso);
        listaIngresos.appendChild(itemIngreso);
    }
    
    // Actualizar contenido
    itemIngreso.innerHTML = `
        <span class="calculadora-concepto-nombre">${nombreIngreso}</span>
        <span class="calculadora-concepto-monto">S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    `;
}

// Función para remover ingresos de la sección
function removerIngresoEnSeccion(seccionTrabajador, nombreIngreso) {
    const listaIngresos = seccionTrabajador.querySelector('.calculadora-conceptos-lista[data-tipo="ingresos"]');
    if (!listaIngresos) return;
    
    const itemIngreso = listaIngresos.querySelector(`.calculadora-concepto-item[data-ingreso="${nombreIngreso}"]`);
    if (itemIngreso) {
        itemIngreso.remove();
    }
}

// Función para limpiar descuentos en la sección
function limpiarDescuentosEnSeccion(seccionTrabajador) {
    const listaDescuentos = seccionTrabajador.querySelector('.calculadora-conceptos-lista[data-tipo="descuentos"]');
    if (!listaDescuentos) return;
    
    // Limpiar todos los descuentos dinámicos (conservar estructura base si existe)
    listaDescuentos.innerHTML = '';
}

// Función para actualizar aportes del empleador en la sección
function actualizarAporteEmpleadorEnSeccion(seccionTrabajador, nombreAporte, porcentaje, monto, baseCalculo) {
    const listaAportesEmpleador = seccionTrabajador.querySelector('.calculadora-conceptos-lista[data-tipo="aportes-empleador"]');
    
    if (!listaAportesEmpleador) return;
    
    // Buscar si ya existe el aporte
    let itemAporte = listaAportesEmpleador.querySelector(`.calculadora-concepto-aporte[data-concepto="${nombreAporte}"]`);
    
    if (monto > 0) {
        if (!itemAporte) {
            // Crear nuevo item de aporte del empleador
            itemAporte = document.createElement('div');
            itemAporte.className = 'calculadora-concepto-item calculadora-concepto-aporte';
            itemAporte.setAttribute('data-concepto', nombreAporte);
            itemAporte.setAttribute('data-porcentaje', porcentaje);
            itemAporte.setAttribute('data-monto', monto);
            itemAporte.setAttribute('data-base-calculo', baseCalculo);
            listaAportesEmpleador.appendChild(itemAporte);
        } else {
            // Actualizar datos existentes
            itemAporte.setAttribute('data-monto', monto);
            itemAporte.setAttribute('data-base-calculo', baseCalculo);
        }
        
        // Actualizar contenido
        itemAporte.innerHTML = `
            <span class="calculadora-concepto-nombre">${nombreAporte} (${porcentaje}%)</span>
            <span class="calculadora-concepto-monto">S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
    } else {
        // Si el monto es 0, remover el item
        if (itemAporte) {
            itemAporte.remove();
        }
    }
}

// Función para actualizar el resumen por conceptos
function actualizarResumenPorConceptos() {
    try {
        console.log('[PlanillasManager] Actualizando resumen por conceptos...');
        
        const resumenTable = document.getElementById('resumenConceptosBody');
        if (!resumenTable) {
            console.error('[PlanillasManager] Tabla de resumen no encontrada');
            return;
        }
        
        // Objeto para acumular conceptos
        const resumenConceptos = {};
        
        // Iterar sobre todas las secciones de trabajadores
        const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
        
        seccionesTrabajadores.forEach(seccion => {
            // 1. CONCEPTOS FIJOS DE INGRESOS (Sueldo Básico, Movilidad, etc.)
            const conceptosFijos = seccion.querySelectorAll('.calculadora-concepto-fijo');
            conceptosFijos.forEach(concepto => {
                const conceptoNombre = concepto.dataset.concepto;
                const montoTexto = concepto.querySelector('.calculadora-concepto-monto')?.textContent || 'S/ 0';
                const monto = parseFloat(montoTexto.replace('S/', '').replace(',', '').trim()) || 0;
                
                // Determinar el nombre legible del concepto
                let nombreLegible = conceptoNombre;
                let tipo = 'Ingreso';
                
                switch (conceptoNombre) {
                    case 'sueldo_basico':
                        nombreLegible = 'Sueldo Básico';
                        break;
                    case 'movilidad':
                        nombreLegible = 'Movilidad';
                        break;
                    case 'refrigerio':
                        nombreLegible = 'Refrigerio';
                        break;
                    default:
                        nombreLegible = conceptoNombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                
                if (monto > 0) {
                    if (!resumenConceptos[nombreLegible]) {
                        resumenConceptos[nombreLegible] = {
                            tipo: tipo,
                            cantidadTrabajadores: 0,
                            montoTotal: 0
                        };
                    }
                    resumenConceptos[nombreLegible].cantidadTrabajadores++;
                    resumenConceptos[nombreLegible].montoTotal += monto;
                }
            });
            
            // 2. CONCEPTOS DINÁMICOS DE INGRESOS (Movilidad, Refrigerio, etc.)
            const conceptosDinamicos = seccion.querySelectorAll('.calculadora-concepto-dinamico');
            conceptosDinamicos.forEach(concepto => {
                const nombreConcepto = concepto.querySelector('.calculadora-concepto-nombre')?.textContent || '';
                const montoTexto = concepto.querySelector('.calculadora-concepto-monto')?.textContent || 'S/ 0';
                const monto = parseFloat(montoTexto.replace('S/', '').replace(',', '').trim()) || 0;
                
                if (monto > 0 && nombreConcepto) {
                    if (!resumenConceptos[nombreConcepto]) {
                        resumenConceptos[nombreConcepto] = {
                            tipo: 'Ingreso',
                            cantidadTrabajadores: 0,
                            montoTotal: 0
                        };
                    }
                    resumenConceptos[nombreConcepto].cantidadTrabajadores++;
                    resumenConceptos[nombreConcepto].montoTotal += monto;
                }
            });
            
            // 3. CONCEPTOS CALCULADOS DE INGRESOS (Horas Extras)
            const ingresosCalculados = seccion.querySelectorAll('.calculadora-concepto-item[data-ingreso]');
            ingresosCalculados.forEach(item => {
                const nombreIngreso = item.dataset.ingreso;
                const montoTexto = item.querySelector('.calculadora-concepto-monto')?.textContent || 'S/ 0';
                const monto = parseFloat(montoTexto.replace('S/', '').replace(',', '').trim()) || 0;
                
                if (monto > 0) {
                    if (!resumenConceptos[nombreIngreso]) {
                        resumenConceptos[nombreIngreso] = {
                            tipo: 'Ingreso',
                            cantidadTrabajadores: 0,
                            montoTotal: 0
                        };
                    }
                    resumenConceptos[nombreIngreso].cantidadTrabajadores++;
                    resumenConceptos[nombreIngreso].montoTotal += monto;
                }
            });
            
            // 4. DESCUENTOS (Faltas)
            const descuentos = seccion.querySelectorAll('.calculadora-concepto-item[data-descuento]');
            descuentos.forEach(item => {
                const nombreDescuento = item.dataset.descuento;
                const montoTexto = item.querySelector('.calculadora-concepto-monto')?.textContent || 'S/ 0';
                const monto = parseFloat(montoTexto.replace('S/', '').replace(',', '').trim()) || 0;
                
                if (monto > 0) {
                    if (!resumenConceptos[nombreDescuento]) {
                        resumenConceptos[nombreDescuento] = {
                            tipo: 'Descuento',
                            cantidadTrabajadores: 0,
                            montoTotal: 0
                        };
                    }
                    resumenConceptos[nombreDescuento].cantidadTrabajadores++;
                    resumenConceptos[nombreDescuento].montoTotal += monto;
                }
            });
            
            // 5. APORTES DEL TRABAJADOR (ONP, SPP, etc.)
            const aportes = seccion.querySelectorAll('.calculadora-conceptos-lista[data-tipo="aportes-trabajador"] .calculadora-concepto-aporte');
            aportes.forEach(aporte => {
                const nombreAporte = aporte.dataset.concepto;
                const monto = parseFloat(aporte.dataset.monto) || 0;
                
                if (monto > 0 && nombreAporte) {
                    if (!resumenConceptos[nombreAporte]) {
                        resumenConceptos[nombreAporte] = {
                            tipo: 'aporte-trabajador',
                            cantidadTrabajadores: 0,
                            montoTotal: 0
                        };
                    }
                    resumenConceptos[nombreAporte].cantidadTrabajadores++;
                    resumenConceptos[nombreAporte].montoTotal += monto;
                }
            });
        });
        
        // Generar filas de la tabla
        const tbody = document.getElementById('resumenConceptosBody');
        if (!tbody) return;
        
        const conceptosEntries = Object.entries(resumenConceptos);
        
        if (conceptosEntries.length === 0) {
            tbody.innerHTML = `
                <tr class="tabla-vacia">
                    <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                        <p>No hay conceptos calculados</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = conceptosEntries.map(([nombreConcepto, datos]) => `
            <tr>
                <td>${nombreConcepto}</td>
                <td>
                    <span class="badge badge-${datos.tipo}">${obtenerTextoTipoConcepto(datos.tipo)}</span>
                </td>
                <td style="text-align: center;">${datos.cantidadTrabajadores}</td>
                <td style="text-align: right; font-weight: 500;">
                    S/ ${datos.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
            </tr>
        `).join('');
        
        console.log('[PlanillasManager] Resumen por conceptos actualizado:', conceptosEntries.length);
        
    } catch (error) {
        console.error('[PlanillasManager] Error actualizando resumen por conceptos:', error);
    }
}

// Función auxiliar para obtener texto del tipo de concepto
function obtenerTextoTipoConcepto(tipo) {
    const tipos = {
        'Ingreso': 'Ingreso',
        'ingreso': 'Ingreso',
        'Descuento': 'Descuento',
        'descuento': 'Descuento',
        'aporte-trabajador': 'Aporte Trabajador',
        'aporte-empleador': 'Aporte Empleador'
    };
    return tipos[tipo] || tipo;
}

// ============================================
// FUNCIONES AUXILIARES PARA GUARDAR PLANILLAS
// ============================================

// Función para obtener datos del formulario de planilla
function obtenerDatosFormularioPlanilla() {
    try {
        // Obtener elementos del formulario con selectores más específicos
        const tipoPeriodoSelect = document.querySelector('#modalCrearPlanilla select.planilla-modal-input');
        const mesSelect = document.getElementById('selectMes');
        const anoInput = document.getElementById('inputAno');
        const fechaInicioInput = document.getElementById('inputFechaInicio');
        const fechaFinInput = document.getElementById('inputFechaFin');
        const observacionesTextarea = document.querySelector('#modalCrearPlanilla textarea.planilla-modal-textarea');
        
        console.log('[PlanillasManager] Elementos del formulario encontrados:', {
            tipoPeriodoSelect: tipoPeriodoSelect ? tipoPeriodoSelect.value : 'NO ENCONTRADO',
            mesSelect: mesSelect ? mesSelect.value : 'NO ENCONTRADO',
            anoInput: anoInput ? anoInput.value : 'NO ENCONTRADO',
            fechaInicioInput: fechaInicioInput ? fechaInicioInput.value : 'NO ENCONTRADO',
            fechaFinInput: fechaFinInput ? fechaFinInput.value : 'NO ENCONTRADO',
            observacionesTextarea: observacionesTextarea ? observacionesTextarea.value : 'NO ENCONTRADO'
        });
        
        // Validar campos requeridos
        if (!tipoPeriodoSelect?.value) {
            alert('Debe seleccionar el tipo de período');
            return null;
        }
        
        if (!mesSelect?.value) {
            alert('Debe seleccionar el mes');
            return null;
        }
        
        if (!anoInput?.value) {
            alert('Debe ingresar el año');
            return null;
        }
        
        if (!fechaInicioInput?.value) {
            alert('Debe ingresar la fecha de inicio');
            return null;
        }
        
        if (!fechaFinInput?.value) {
            alert('Debe ingresar la fecha de fin');
            return null;
        }
        
        // Generar nombre automático
        const nombreMes = getNombreMes(parseInt(mesSelect.value));
        const nombre = `Planilla ${tipoPeriodoSelect.value === 'mensual' ? 'Mensual' : 'Quincenal'} ${nombreMes} ${anoInput.value}`;
        
        const datosPlanilla = {
            nombre,
            tipoPeriodo: tipoPeriodoSelect.value,
            mes: parseInt(mesSelect.value) || null,
            ano: parseInt(anoInput.value) || null,
            fechaInicio: fechaInicioInput.value || null,
            fechaFin: fechaFinInput.value || null,
            observaciones: observacionesTextarea?.value || null
        };
        
        console.log('[PlanillasManager] Datos de planilla recopilados:', datosPlanilla);
        
        // Verificar que no hay valores undefined
        for (const [key, value] of Object.entries(datosPlanilla)) {
            if (value === undefined) {
                console.error(`[PlanillasManager] Campo ${key} es undefined`);
                alert(`Error: El campo ${key} no tiene un valor válido`);
                return null;
            }
        }
        
        return datosPlanilla;
        
    } catch (error) {
        console.error('[PlanillasManager] Error obteniendo datos del formulario:', error);
        alert('Error procesando el formulario');
        return null;
    }
}

// Función para obtener nombre del mes
function getNombreMes(numeroMes) {
    const meses = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numeroMes] || 'Mes';
}

// Función para recopilar todos los datos calculados
function recopilarDatosCalculados() {
    try {
        console.log('[PlanillasManager] Recopilando datos calculados...');
        
        const trabajadores = [];
        let totalIngresosPlanilla = 0;
        let totalDescuentosPlanilla = 0;
        let totalAportesTrabajadorPlanilla = 0;
        let totalAportesEmpleadorPlanilla = 0;
        let totalNetoPlanilla = 0;
        let totalConceptosPlanilla = 0;
        
        // Recorrer cada sección de trabajador
        const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
        console.log('[PlanillasManager] Encontradas', seccionesTrabajadores.length, 'secciones de trabajadores');
        
        seccionesTrabajadores.forEach((seccion, index) => {
            const trabajadorId = parseInt(seccion.dataset.trabajadorId);
            const nombreElement = seccion.querySelector('.calculadora-trabajador-nombre');
            const nombre = nombreElement ? nombreElement.textContent.trim() : `Trabajador ${index + 1}`;
            
            console.log(`[PlanillasManager] Procesando trabajador ${trabajadorId} - ${nombre}`);
            
            // Obtener datos de asistencia
            const diasLaborados = parseInt(seccion.querySelector(`input[data-campo="dias_laborados"]`)?.value) || 30;
            const horasExtras25 = parseFloat(seccion.querySelector(`input[data-campo="horas_extras_25"]`)?.value) || 0;
            const horasExtras35 = parseFloat(seccion.querySelector(`input[data-campo="horas_extras_35"]`)?.value) || 0;
            const faltas = parseInt(seccion.querySelector(`input[data-campo="faltas"]`)?.value) || 0;
            
            // Obtener totales del trabajador desde el DOM
            const netoElement = document.getElementById(`neto-${trabajadorId}`);
            let totalIngresos = 0;
            let totalDescuentos = 0;
            let totalAportes = 0;
            let sueldoNeto = 0;
            
            if (netoElement) {
                totalIngresos = parseFloat(netoElement.dataset.ingresos) || 0;
                totalDescuentos = parseFloat(netoElement.dataset.descuentos) || 0;
                totalAportes = parseFloat(netoElement.dataset.aportes) || 0;
                sueldoNeto = parseFloat(netoElement.dataset.neto) || 0;
            }
            
            console.log(`[PlanillasManager] Totales trabajador ${trabajadorId}:`, {
                ingresos: totalIngresos,
                descuentos: totalDescuentos,
                aportes: totalAportes,
                neto: sueldoNeto
            });
            
            // Recopilar conceptos del trabajador
            const conceptos = [];
            
            // 1. CONCEPTOS DINÁMICOS DE INGRESOS (vienen de tabla conceptos)
            const conceptosDinamicos = seccion.querySelectorAll('.calculadora-concepto-dinamico');
            conceptosDinamicos.forEach(concepto => {
                const idConcepto = parseInt(concepto.dataset.conceptoId);
                const montoCalculado = parseFloat(concepto.dataset.montoCalculado) || 0;
                
                if (montoCalculado > 0 && idConcepto) {
                    conceptos.push({
                        idConcepto,
                        codigo: concepto.dataset.codigo || `CONCEPTO_${idConcepto}`,
                        nombre: concepto.querySelector('.calculadora-concepto-nombre')?.textContent || 'Concepto',
                        tipo: 'ingreso',
                        tipoCalculo: concepto.dataset.tipoCalculo || 'monto-fijo',
                        valorOriginal: parseFloat(concepto.dataset.valor) || 0,
                        baseCalculo: parseFloat(concepto.dataset.baseCalculo) || null,
                        montoCalculado,
                        formulaAplicada: concepto.dataset.formula || null
                    });
                    totalConceptosPlanilla++;
                }
            });
            
            // 2. APORTES DEL TRABAJADOR (calculados pero vienen de conceptos del sistema)
            const aportesTrabajador = seccion.querySelectorAll('.calculadora-conceptos-lista[data-tipo="aportes-trabajador"] .calculadora-concepto-aporte');
            aportesTrabajador.forEach(aporte => {
                const monto = parseFloat(aporte.dataset.monto) || 0;
                if (monto > 0) {
                    // Los aportes no tienen id_concepto específico, pero son del sistema
                    conceptos.push({
                        idConcepto: null, // Los aportes se calculan dinámicamente
                        codigo: aporte.dataset.concepto?.replace(/[^A-Z0-9]/g, '_') || 'APORTE',
                        nombre: aporte.dataset.concepto || 'Aporte',
                        tipo: 'aporte-trabajador',
                        tipoCalculo: 'porcentaje',
                        valorOriginal: parseFloat(aporte.dataset.porcentaje) || 0,
                        baseCalculo: parseFloat(aporte.dataset.baseCalculo) || null,
                        montoCalculado: monto,
                        formulaAplicada: `${aporte.dataset.concepto}: ${aporte.dataset.porcentaje}% de S/ ${parseFloat(aporte.dataset.baseCalculo || 0).toFixed(2)}`
                    });
                    totalConceptosPlanilla++;
                }
            });
            
            // 3. APORTES DEL EMPLEADOR (calculados pero vienen de conceptos del sistema)
            const aportesEmpleador = seccion.querySelectorAll('.calculadora-conceptos-lista[data-tipo="aportes-empleador"] .calculadora-concepto-aporte');
            let totalAportesEmpleador = 0;
            aportesEmpleador.forEach(aporte => {
                const monto = parseFloat(aporte.dataset.monto) || 0;
                if (monto > 0) {
                    totalAportesEmpleador += monto;
                    conceptos.push({
                        idConcepto: null,
                        codigo: aporte.dataset.concepto?.replace(/[^A-Z0-9]/g, '_') || 'APORTE_EMP',
                        nombre: aporte.dataset.concepto || 'Aporte Empleador',
                        tipo: 'aporte-empleador',
                        tipoCalculo: 'porcentaje',
                        valorOriginal: parseFloat(aporte.dataset.porcentaje) || 0,
                        baseCalculo: parseFloat(aporte.dataset.baseCalculo) || null,
                        montoCalculado: monto,
                        formulaAplicada: `${aporte.dataset.concepto}: ${aporte.dataset.porcentaje}% de S/ ${parseFloat(aporte.dataset.baseCalculo || 0).toFixed(2)}`
                    });
                    totalConceptosPlanilla++;
                }
            });
            
            // Agregar trabajador al array
            trabajadores.push({
                idTrabajador: trabajadorId,
                nombre: nombre,
                diasLaborados,
                horasExtras25,
                horasExtras35,
                faltas,
                totalIngresos,
                totalDescuentos,
                totalAportes: totalAportes,
                totalAportesEmpleador: totalAportesEmpleador,
                sueldoNeto: sueldoNeto,
                conceptos
            });
            
            // Sumar a totales generales
            totalIngresosPlanilla += totalIngresos;
            totalDescuentosPlanilla += totalDescuentos;
            totalAportesTrabajadorPlanilla += totalAportes;
            totalAportesEmpleadorPlanilla += totalAportesEmpleador;
            totalNetoPlanilla += sueldoNeto;
        });
        
        const datosCalculados = {
            trabajadores,
            totalesPlanilla: {
                totalConceptos: totalConceptosPlanilla,
                totalIngresos: totalIngresosPlanilla,
                totalDescuentos: totalDescuentosPlanilla,
                totalAportesTrabajador: totalAportesTrabajadorPlanilla,
                totalAportesEmpleador: totalAportesEmpleadorPlanilla,
                totalNeto: totalNetoPlanilla
            }
        };
        
        console.log('[PlanillasManager] Datos calculados recopilados exitosamente:', {
            trabajadores: trabajadores.length,
            totales: datosCalculados.totalesPlanilla,
            tieneConceptos: totalConceptosPlanilla > 0
        });
        
        // Validar que hay datos para retornar
        if (trabajadores.length === 0) {
            console.warn('[PlanillasManager] No se encontraron trabajadores para recopilar');
            return null;
        }
        
        return datosCalculados;
        
    } catch (error) {
        console.error('[PlanillasManager] Error recopilando datos calculados:', error);
        return null;
    }
}

// ============================================
// FUNCIONES PARA MANEJAR PLANILLAS EXISTENTES
// ============================================

// Función para abrir calculadora de planilla existente
async function abrirCalculadoraPlanilla(idPlanilla) {
    try {
        console.log(`[PlanillasManager] Abriendo calculadora para planilla ${idPlanilla}`);
        
        // Obtener detalle de la planilla
        const response = await window.electronAPI.obtenerDetallePlanilla(idPlanilla);
        
        if (response.success) {
            const planilla = response.planilla;
            planillaActualId = idPlanilla;
            
            console.log('[PlanillasManager] Datos de planilla obtenidos:', {
                nombre: planilla.nombre,
                estado: planilla.estado,
                trabajadores: planilla.trabajadores?.length || 0
            });
            
            // Verificar que la planilla esté en estado borrador
            if (planilla.estado !== 'borrador') {
                alert('Solo se pueden calcular planillas en estado borrador');
                return;
            }
            
            // Si no hay trabajadores, obtenerlos de la base de datos
            let trabajadores = planilla.trabajadores;
            if (!trabajadores || trabajadores.length === 0) {
                console.log('[PlanillasManager] Obteniendo trabajadores de la planilla...');
                try {
                    const trabajadoresResponse = await window.electronAPI.obtenerTrabajadoresPlanilla(idPlanilla);
                    console.log('[PlanillasManager] Respuesta completa de obtenerTrabajadoresPlanilla:', trabajadoresResponse);
                    
                    if (trabajadoresResponse && trabajadoresResponse.success) {
                        trabajadores = trabajadoresResponse.trabajadores;
                        console.log('[PlanillasManager] Trabajadores obtenidos de la BD:', trabajadores);
                        
                        // Log detallado de cada trabajador
                        if (trabajadores && trabajadores.length > 0) {
                            trabajadores.forEach((trab, index) => {
                                console.log(`[PlanillasManager] Trabajador ${index + 1} en BD:`, {
                                    id: trab.id || trab.id_trabajador,
                                    id_planilla_trabajador: trab.id_planilla_trabajador,
                                    trabajador_nombres: trab.trabajador_nombres,
                                    trabajador_apellidos: trab.trabajador_apellidos,
                                    trabajador_area: trab.trabajador_area,
                                    sueldo_basico: trab.sueldo_basico,
                                    // Campos alternativos
                                    nombres: trab.nombres,
                                    apellidos: trab.apellidos,
                                    area: trab.area,
                                    sueldo: trab.sueldo,
                                    todasPropiedades: Object.keys(trab)
                                });
                            });
                        }
                    } else {
                        console.error('[PlanillasManager] Respuesta inválida al obtener trabajadores:', trabajadoresResponse);
                        throw new Error('No se pudieron obtener los trabajadores de la planilla');
                    }
                } catch (error) {
                    console.error('[PlanillasManager] Error obteniendo trabajadores:', error);
                    // Intentar con trabajadores vacíos para no bloquear
                    trabajadores = [];
                    alert('Advertencia: No se pudieron cargar los trabajadores de la planilla. Se abrirá la calculadora vacía.');
                }
            } else {
                console.log('[PlanillasManager] Usando trabajadores de la planilla original:', trabajadores);
                // Log detallado de trabajadores originales
                if (trabajadores && trabajadores.length > 0) {
                    trabajadores.forEach((trab, index) => {
                        console.log(`[PlanillasManager] Trabajador ${index + 1} original:`, {
                            id: trab.id || trab.id_trabajador,
                            // Campos de planilla_trabajadores
                            trabajador_nombres: trab.trabajador_nombres,
                            trabajador_apellidos: trab.trabajador_apellidos,
                            trabajador_area: trab.trabajador_area,
                            sueldo_basico: trab.sueldo_basico,
                            // Campos alternativos
                            nombres: trab.nombres,
                            apellidos: trab.apellidos,
                            area: trab.area,
                            sueldo: trab.sueldo,
                            todasPropiedades: Object.keys(trab)
                        });
                    });
                }
            }
            
            console.log('[PlanillasManager] Trabajadores finales para la calculadora:', trabajadores);
            
            // Verificar disponibilidad de la función antes de llamarla
            console.log('[PlanillasManager] Verificando disponibilidad de abrirModalCalculadora:', typeof abrirModalCalculadora);
            console.log('[PlanillasManager] Verificando disponibilidad global de abrirModalCalculadora:', typeof window.abrirModalCalculadora);
            
            // Abrir modal calculadora con los datos existentes
            abrirModalCalculadora(trabajadores, idPlanilla, planilla);
            
            // Mostrar mensaje de éxito
            mostrarMensajeTemporalInfo(`✅ Calculadora abierta para: ${planilla.nombre}`);
            
        } else {
            throw new Error(response.error || 'Error obteniendo detalle de planilla');
        }
        
    } catch (error) {
        console.error('[PlanillasManager] Error abriendo calculadora:', error);
        alert('Error al abrir la calculadora: ' + error.message);
    }
}

// Función para ver detalle de planilla (solo lectura)
async function verDetallePlanilla(idPlanilla) {
    try {
        console.log(`[PlanillasManager] Mostrando detalle de planilla ${idPlanilla}`);
        
        // Obtener datos de la planilla
        const response = await window.electronAPI.obtenerDetallePlanilla(idPlanilla);
        
        if (response.success) {
            const planilla = response.planilla;
            
            // Llenar datos del modal
            llenarModalDetallePlanilla(planilla);
            
            // Asegurar que el modal esté configurado antes de abrirlo
            configurarModalDetallePlanilla();
            
            // Mostrar modal
            const modal = document.getElementById('modalDetallePlanilla');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevenir scroll del body
                console.log('[PlanillasManager] Modal de detalle abierto');
            } else {
                console.error('[PlanillasManager] Modal de detalle no encontrado');
            }
            
        } else {
            console.error('[PlanillasManager] Error obteniendo detalle:', response.error);
            alert('Error al obtener los detalles de la planilla: ' + response.error);
        }
        
    } catch (error) {
        console.error('[PlanillasManager] Error mostrando detalle de planilla:', error);
        alert('Error al mostrar el detalle de la planilla');
    }
}

// Función para llenar el modal de detalle con datos de la planilla
function llenarModalDetallePlanilla(planilla) {
    try {
        console.log('[PlanillasManager] Llenando modal de detalle:', planilla);
        
        // Título de la planilla
        const titulo = document.getElementById('detalleTituloPlanilla');
        if (titulo) {
            titulo.textContent = planilla.nombre || 'Planilla Sin Nombre';
        }
        
        // Etiquetas de tipo y estado
        const tipoEtiqueta = document.getElementById('detalleTipoPlanilla');
        const estadoEtiqueta = document.getElementById('detalleEstadoPlanilla');
        
        if (tipoEtiqueta) {
            tipoEtiqueta.textContent = planilla.tipo_periodo === 'mensual' ? 'Mensual' : 'Quincenal';
            tipoEtiqueta.className = `detalle-etiqueta ${planilla.tipo_periodo === 'mensual' ? 'detalle-etiqueta-mensual' : 'detalle-etiqueta-variable'}`;
        }
        
        if (estadoEtiqueta) {
            estadoEtiqueta.textContent = obtenerTextoEstadoPlanilla(planilla.estado);
            estadoEtiqueta.className = `detalle-etiqueta detalle-etiqueta-${planilla.estado}`;
        }
        
        // Información del período
        const fechaInicio = document.getElementById('detalleFechaInicio');
        const fechaFin = document.getElementById('detalleFechaFin');
        const tipoPeriodo = document.getElementById('detalleTipoPeriodo');
        const estadoActual = document.getElementById('detalleEstadoActual');
        
        if (fechaInicio) {
            fechaInicio.textContent = formatearFechaPlanilla(planilla.fecha_inicio);
        }
        
        if (fechaFin) {
            fechaFin.textContent = formatearFechaPlanilla(planilla.fecha_fin);
        }
        
        if (tipoPeriodo) {
            tipoPeriodo.textContent = planilla.tipo_periodo === 'mensual' ? 'Mensual' : 'Quincenal';
        }
        
        if (estadoActual) {
            estadoActual.innerHTML = `<span class="detalle-estado-badge detalle-estado-${planilla.estado}">${obtenerTextoEstadoPlanilla(planilla.estado)}</span>`;
        }
        
        // Resumen financiero
        const totalIngresos = document.getElementById('detalleTotalIngresos');
        const totalDescuentos = document.getElementById('detalleTotalDescuentos');
        const aportesTrabajador = document.getElementById('detalleAportesTrabajador');
        const aportesEmpleador = document.getElementById('detalleAportesEmpleador');
        const totalNeto = document.getElementById('detalleTotalNeto');
        
        if (totalIngresos) {
            totalIngresos.textContent = formatearMonedaPlanilla(planilla.total_ingresos || 0);
        }
        
        if (totalDescuentos) {
            totalDescuentos.textContent = formatearMonedaPlanilla(planilla.total_descuentos || 0);
        }
        
        if (aportesTrabajador) {
            aportesTrabajador.textContent = formatearMonedaPlanilla(planilla.total_aportes_trabajador || 0);
        }
        
        if (aportesEmpleador) {
            aportesEmpleador.textContent = formatearMonedaPlanilla(planilla.total_aportes_empleador || 0);
        }
        
        if (totalNeto) {
            totalNeto.textContent = formatearMonedaPlanilla(planilla.total_neto_pagar || 0);
        }
        
        // Información de auditoría
        const creadaPor = document.getElementById('detalleCreadaPor');
        const fechaCreacion = document.getElementById('detalleFechaCreacion');
        const modificadaPor = document.getElementById('detalleModificadaPor');
        const fechaModificacion = document.getElementById('detalleFechaModificacion');
        
        if (creadaPor) {
            creadaPor.textContent = 'Sistema Automático';
        }
        
        if (fechaCreacion) {
            fechaCreacion.textContent = formatearFechaCompletaPlanilla(planilla.fecha_creacion);
        }
        
        if (modificadaPor) {
            modificadaPor.textContent = 'Sistema Automático';
        }
        
        if (fechaModificacion) {
            fechaModificacion.textContent = formatearFechaCompletaPlanilla(planilla.fecha_actualizacion || planilla.fecha_creacion);
        }
        
    } catch (error) {
        console.error('[PlanillasManager] Error llenando modal de detalle:', error);
    }
}

// Función auxiliar para obtener texto del estado
function obtenerTextoEstadoPlanilla(estado) {
    const estados = {
        'borrador': 'Borrador',
        'calculada': 'Calculada',
        'procesando': 'Procesando',
        'finalizada': 'Finalizada',
        'pagada': 'Pagada'
    };
    return estados[estado] || estado;
}

// Función auxiliar para formatear fecha (DD/MM/YYYY)
function formatearFechaPlanilla(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
}

// Función auxiliar para formatear fecha completa
function formatearFechaCompletaPlanilla(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función auxiliar para formatear moneda
function formatearMonedaPlanilla(monto) {
    return `S/ ${parseFloat(monto || 0).toLocaleString('es-PE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
}

// Función para mostrar menú de opciones de planilla
function mostrarMenuPlanilla(idPlanilla) {
    console.log(`[PlanillasManager] Menú para planilla ${idPlanilla}`);
    // Por implementar: menú contextual con opciones
    alert(`Menú de opciones para planilla ${idPlanilla} por implementar`);
}

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================

// Event listener para cargar planillas cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('[PlanillasManager] DOM cargado, iniciando carga de planillas...');
    
    // Cargar planillas existentes
    cargarPlanillas().then(() => {
        console.log('[PlanillasManager] Carga inicial completada');
    }).catch(error => {
        console.error('[PlanillasManager] Error en carga inicial:', error);
    });
    
    // Configurar filtros
    configurarFiltrosPlanillas();
    
    // Configurar modal de detalle de planilla
    configurarModalDetallePlanilla();
});

// Función para configurar el modal de detalle de planilla
function configurarModalDetallePlanilla() {
    console.log('[PlanillasManager] Configurando modal de detalle...');
    
    const modal = document.getElementById('modalDetallePlanilla');
    const btnCerrar = document.getElementById('btnCerrarDetalle');
    const btnCerrarFooter = document.getElementById('btnCerrarDetallePlanilla');
    const btnEditar = document.getElementById('btnEditarPlanilla');
    
    if (!modal) {
        console.error('[PlanillasManager] Modal de detalle no encontrado');
        return;
    }
    
    console.log('[PlanillasManager] Elementos encontrados:', {
        modal: !!modal,
        btnCerrar: !!btnCerrar,
        btnCerrarFooter: !!btnCerrarFooter,
        btnEditar: !!btnEditar
    });
    
    // Función para cerrar el modal
    function cerrarModal() {
        console.log('[PlanillasManager] Cerrando modal de detalle');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
    
    // Cerrar modal con botón X
    if (btnCerrar) {
        // Clonar el elemento para remover todos los event listeners previos
        const newBtnCerrar = btnCerrar.cloneNode(true);
        btnCerrar.parentNode.replaceChild(newBtnCerrar, btnCerrar);
        
        newBtnCerrar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[PlanillasManager] Click en botón X');
            cerrarModal();
        });
        console.log('[PlanillasManager] Event listener agregado al botón X');
    } else {
        console.error('[PlanillasManager] Botón cerrar X no encontrado');
    }
    
    // Cerrar modal con botón del footer
    if (btnCerrarFooter) {
        // Clonar el elemento para remover todos los event listeners previos
        const newBtnCerrarFooter = btnCerrarFooter.cloneNode(true);
        btnCerrarFooter.parentNode.replaceChild(newBtnCerrarFooter, btnCerrarFooter);
        
        newBtnCerrarFooter.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[PlanillasManager] Click en botón Cerrar del footer');
            cerrarModal();
        });
        console.log('[PlanillasManager] Event listener agregado al botón Cerrar');
    } else {
        console.error('[PlanillasManager] Botón cerrar del footer no encontrado');
    }
    
    // Cerrar modal haciendo click fuera de él (remover listener previo y agregar nuevo)
    const newModal = modal.cloneNode(true);
    modal.parentNode.replaceChild(newModal, modal);
    
    newModal.addEventListener('click', function(e) {
        if (e.target === newModal) {
            console.log('[PlanillasManager] Click fuera del modal');
            cerrarModal();
        }
    });
    
    // Botón de editar (por implementar)
    const btnEditarNew = document.getElementById('btnEditarPlanilla');
    if (btnEditarNew) {
        btnEditarNew.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Implementar funcionalidad de editar
            alert('Funcionalidad de editar por implementar');
        });
    }
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && newModal && newModal.style.display === 'block') {
            console.log('[PlanillasManager] Tecla Escape presionada');
            cerrarModal();
        }
    });
    
    console.log('[PlanillasManager] Modal de detalle configurado exitosamente');
}

// Función global para cerrar el modal de detalle
function cerrarModalDetalle() {
    console.log('[PlanillasManager] Cerrando modal de detalle (función global)');
    const modal = document.getElementById('modalDetallePlanilla');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
}

// Función para configurar el modal calculadora
function configurarModalCalculadora() {
    console.log('[PlanillasManager] Configurando modal calculadora...');
    
    const modal = document.getElementById('modalCalculadoraPlanilla');
    const btnCancelar = document.getElementById('btnCancelarCalculadora');
    const btnGuardar = document.getElementById('btnGuardarCalculadora');
    const btnCalcular = document.getElementById('btnCalcularPlanilla');
    
    if (!modal) {
        console.error('[PlanillasManager] Modal calculadora no encontrado');
        return;
    }
    
    // Configurar botón cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[PlanillasManager] Cancelando calculadora');
            cerrarModalCalculadora();
        });
        console.log('[PlanillasManager] Botón cancelar configurado');
    }
    
    // Configurar botón guardar
    if (btnGuardar) {
        // El event listener para guardar ya está configurado en otra parte
        console.log('[PlanillasManager] Botón guardar encontrado');
    }
    
    // Configurar botón calcular
    if (btnCalcular) {
        // El event listener para calcular ya está configurado en otra parte
        console.log('[PlanillasManager] Botón calcular encontrado');
    }
    
    // Cerrar modal haciendo click fuera de él
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('[PlanillasManager] Click fuera del modal calculadora');
            cerrarModalCalculadora();
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            console.log('[PlanillasManager] Cerrando calculadora con Escape');
            cerrarModalCalculadora();
        }
    });
    
    console.log('[PlanillasManager] Modal calculadora configurado exitosamente');
}

// Función para configurar los filtros de la tabla
function configurarFiltrosPlanillas() {
    // Filtro de búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const busqueda = e.target.value.trim();
            cargarPlanillas({ busqueda });
        });
    }
    
    // Filtros de select
    const estadoSelect = document.querySelector('.filter-select');
    const anoSelect = document.querySelectorAll('.filter-select')[1];
    
    if (estadoSelect) {
        estadoSelect.addEventListener('change', function(e) {
            const estado = e.target.value;
            cargarPlanillas({ estado: estado || undefined });
        });
    }
    
    if (anoSelect) {
        anoSelect.addEventListener('change', function(e) {
            const ano = e.target.value;
            cargarPlanillas({ ano: ano ? parseInt(ano) : undefined });
        });
    }
}