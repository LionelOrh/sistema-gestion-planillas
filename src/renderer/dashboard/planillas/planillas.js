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
    function abrirModalCalculadora(trabajadoresSeleccionados) {
        console.log('[PlanillasManager] Abriendo modal calculadora con', trabajadoresSeleccionados.length, 'trabajadores');
        
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
            
            // Actualizar información del modal
            actualizarInfoCalculadora(trabajadoresSeleccionados);
            
            // Configurar navegación de interfaces
            configurarNavegacionCalculadora();
            
            console.log('[PlanillasManager] Modal calculadora abierto');
        }
    }

    // Función para actualizar información del modal calculadora
    async function actualizarInfoCalculadora(trabajadoresSeleccionados) {
        // Actualizar información en el header
        const infoElement = document.querySelector('.calculadora-modal-info');
        if (infoElement) {
            const totalConceptos = 17; // Placeholder - debería ser dinámico
            infoElement.textContent = `${trabajadoresSeleccionados.length} trabajadores • ${totalConceptos} conceptos`;
        }
        
        // Generar secciones dinámicas para cada trabajador
        await generarSeccionesTrabajadores(trabajadoresSeleccionados);
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
                actualizarTarjetasResumen();
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
        const seccion = document.createElement('div');
        seccion.className = 'calculadora-trabajador-section';
        seccion.dataset.trabajadorIndex = index;
        seccion.dataset.trabajadorId = trabajador.id_trabajador;
        
        // Cargar conceptos de ingresos y aportes para este trabajador
        const [conceptosIngresos, aportesTrabajador] = await Promise.all([
            cargarConceptosIngresos(trabajador.id_trabajador),
            cargarAportesTrabajador(trabajador.id_trabajador)
        ]);
        
        // Generar HTML de conceptos y aportes dinámicos
        const ingresosHTML = generarConceptosIngresosHTML(conceptosIngresos, trabajador);
        const aportesHTML = generarAportesHTML(aportesTrabajador);
        
        // Calcular el neto a pagar para este trabajador de forma simplificada
        let totalIngresos = parseFloat(trabajador.sueldo) || 0;
        
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
                <h3 class="calculadora-trabajador-nombre">${trabajador.nombres} ${trabajador.apellidos}</h3>
                <p class="calculadora-trabajador-detalle">${trabajador.area} - S/ ${parseFloat(trabajador.sueldo).toLocaleString('es-PE')}</p>
            </div>
            
            <!-- Contenido en filas -->
            <div class="calculadora-trabajador-content">
                
                <!-- Fila Superior: 3 Columnas (Ingresos, Descuentos, Aportes) -->
                <div class="calculadora-conceptos-fila">
                    
                    <!-- Columna 1: Ingresos -->
                    <div class="calculadora-columna-concepto">
                        <div class="calculadora-seccion">
                            <h4 class="calculadora-seccion-titulo">Ingresos</h4>
                            <div class="calculadora-conceptos-lista" data-tipo="ingresos">
                                <!-- Sueldo Básico siempre presente -->
                                <div class="calculadora-concepto-item calculadora-concepto-fijo" data-concepto="sueldo_basico">
                                    <span class="calculadora-concepto-nombre">Sueldo Básico</span>
                                    <span class="calculadora-concepto-monto">S/ ${parseFloat(trabajador.sueldo).toLocaleString('es-PE')}</span>
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
                                <div class="calculadora-concepto-item">
                                    <span class="calculadora-concepto-nombre">Renta</span>
                                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                                </div>
                                <div class="calculadora-concepto-item">
                                    <span class="calculadora-concepto-nombre">Faltas</span>
                                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                                </div>
                                <div class="calculadora-concepto-item">
                                    <span class="calculadora-concepto-nombre">Préstamos</span>
                                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                                </div>
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
    function generarConceptosIngresosHTML(conceptos, trabajador) {
        if (!conceptos || conceptos.length === 0) {
            return `
                <div class="calculadora-concepto-item calculadora-concepto-vacio">
                    <span class="calculadora-concepto-nombre">Sin conceptos adicionales</span>
                    <span class="calculadora-concepto-monto">S/ 0.00</span>
                </div>
            `;
        }
        
        return conceptos.map(concepto => {
            let montoCalculado = 0;
            let montoMostrar = '0.00';
            
            if (concepto.tipo_calculo === 'monto-fijo') {
                montoCalculado = parseFloat(concepto.valor);
                montoMostrar = montoCalculado.toFixed(2);
            } else if (concepto.tipo_calculo === 'porcentaje') {
                // Calcular porcentaje sobre el sueldo básico
                const sueldoBasico = parseFloat(trabajador.sueldo);
                montoCalculado = (sueldoBasico * parseFloat(concepto.valor)) / 100;
                montoMostrar = montoCalculado.toFixed(2);
            }
            
            return `
                <div class="calculadora-concepto-item calculadora-concepto-dinamico" 
                     data-concepto-id="${concepto.id_concepto}" 
                     data-tipo-calculo="${concepto.tipo_calculo}" 
                     data-valor="${concepto.valor}"
                     data-monto-calculado="${montoCalculado}">
                    <span class="calculadora-concepto-nombre">${concepto.nombre}</span>
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
            btnGuardar.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[PlanillasManager] Guardar planilla calculada');
                // Aquí irá la lógica para guardar
                alert('Funcionalidad de guardado pendiente de implementar');
            });
        }
        
        if (btnCalcular) {
            btnCalcular.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('[PlanillasManager] Calcular planilla');
                // Aquí irá la lógica para calcular
                alert('Funcionalidad de cálculo pendiente de implementar');
            });
        }
    }

    // Función para cerrar modal calculadora
    function cerrarModalCalculadora() {
        const modal = document.getElementById('modalCalculadoraPlanilla');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        console.log('[PlanillasManager] Modal calculadora cerrado');
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
        
        // Botón crear planilla
        const btnCrearPlanilla = document.getElementById('btnCrearPlanilla');
        if (btnCrearPlanilla) {
            btnCrearPlanilla.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[PlanillasManager] Botón crear planilla clickeado');
                
                // Validar que haya trabajadores seleccionados
                const trabajadoresSeleccionados = obtenerTrabajadoresSeleccionados();
                if (trabajadoresSeleccionados.length === 0) {
                    alert('Debe seleccionar al menos un trabajador para crear la planilla.');
                    return;
                }
                
                // Cerrar modal actual y abrir calculadora
                cerrarModalPlanilla();
                abrirModalCalculadora(trabajadoresSeleccionados);
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
            }
            
            // 2. Calcular total de aportes del trabajador
            let totalAportes = 0;
            if (aportesTrabajador && Array.isArray(aportesTrabajador)) {
                aportesTrabajador.forEach(aporte => {
                    totalAportes += parseFloat(aporte.monto) || 0;
                });
            }
            
            // 3. Calcular neto (Ingresos - Aportes)
            const neto = totalIngresos - totalAportes;
            
            console.log(`[PlanillasManager] Cálculo neto trabajador ${trabajadorId}:`, {
                totalIngresos,
                totalAportes,
                neto
            });
            
            return {
                totalIngresos: totalIngresos || 0,
                totalAportes: totalAportes || 0,
                neto: neto || 0
            };
        } catch (error) {
            console.error('[PlanillasManager] Error calculando neto del trabajador:', error);
            return { totalIngresos: 0, totalAportes: 0, neto: 0 };
        }
    }// Función para actualizar el neto a pagar en el DOM
function actualizarNetoTrabajador(trabajadorId, calculosNeto) {
    const netoElement = document.getElementById(`neto-${trabajadorId}`);
    if (netoElement) {
        netoElement.textContent = `S/ ${calculosNeto.neto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        netoElement.dataset.neto = calculosNeto.neto;
        netoElement.dataset.ingresos = calculosNeto.totalIngresos;
        netoElement.dataset.aportes = calculosNeto.totalAportes;
    }
}

// Función para calcular y actualizar totales en las tarjetas de resumen
function actualizarTarjetasResumen() {
    try {
        let totalIngresosPlanilla = 0;
        let totalDescuentosPlanilla = 0; // Por ahora 0
        let totalAportesPlanilla = 0;
        let totalNetoPlanilla = 0;
        
        // Recorrer todos los trabajadores y sumar sus totales
        const netosElements = document.querySelectorAll('[id^="neto-"]');
        
        netosElements.forEach(netoElement => {
            const ingresos = parseFloat(netoElement.dataset.ingresos) || 0;
            const aportes = parseFloat(netoElement.dataset.aportes) || 0;
            const neto = parseFloat(netoElement.dataset.neto) || 0;
            
            totalIngresosPlanilla += ingresos;
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

// Event listener para botón "Calcular Planilla"
document.addEventListener('DOMContentLoaded', function() {
    const btnCalcular = document.getElementById('btnCalcularPlanilla');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            console.log('[PlanillasManager] Botón Calcular Planilla presionado');
            
            // Recalcular todos los netos y totales
            recalcularTodosPlanilla();
            
            // Mostrar mensaje de éxito
            console.log('[PlanillasManager] Planilla recalculada exitosamente');
        });
    }
});

// Función para recalcular toda la planilla
function recalcularTodosPlanilla() {
    try {
        // Recalcular cada trabajador
        const seccionesTrabajadores = document.querySelectorAll('.calculadora-trabajador-section');
        
        seccionesTrabajadores.forEach(seccion => {
            const trabajadorId = seccion.dataset.trabajadorId;
            
            // Obtener conceptos de ingresos dinámicos del DOM
            const conceptosIngresos = [];
            const conceptosDinamicos = seccion.querySelectorAll('.calculadora-concepto-dinamico');
            conceptosDinamicos.forEach(concepto => {
                conceptosIngresos.push({
                    id_concepto: concepto.dataset.conceptoId,
                    monto_calculado: parseFloat(concepto.dataset.montoCalculado) || 0
                });
            });
            
            // Obtener aportes del DOM
            const aportesTrabajador = [];
            const conceptosAportes = seccion.querySelectorAll('.calculadora-concepto-aporte');
            conceptosAportes.forEach(aporte => {
                aportesTrabajador.push({
                    concepto: aporte.dataset.concepto,
                    monto: parseFloat(aporte.dataset.monto) || 0
                });
            });
            
            // Recalcular neto
            const calculosNeto = calcularNetoTrabajador(trabajadorId, conceptosIngresos, aportesTrabajador);
            actualizarNetoTrabajador(trabajadorId, calculosNeto);
        });
        
        // Actualizar tarjetas de resumen
        setTimeout(() => {
            actualizarTarjetasResumen();
        }, 50);
        
        console.log('[PlanillasManager] Recálculo de planilla completado');
    } catch (error) {
        console.error('[PlanillasManager] Error recalculando planilla:', error);
    }
}