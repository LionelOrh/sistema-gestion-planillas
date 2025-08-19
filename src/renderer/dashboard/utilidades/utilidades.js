// Utilidades Manager - Gestión de Utilidades de Trabajadores
class UtilidadesManager {
    constructor() {
        this.trabajadores = [];
        this.utilidadesCalculadas = [];
        this.lastCalculation = null;
        this.init();
    }

    init() {
        console.log('Inicializando Utilidades Manager...');
        this.setupEventListeners();
        this.loadTrabajadores();
        this.setupCurrentYear();
    }

    setupEventListeners() {
        // Botón calcular
        const btnCalcular = document.getElementById('btnCalcularUtilidades');
        if (btnCalcular) {
            btnCalcular.addEventListener('click', (e) => {
                e.preventDefault();
                this.calcularUtilidades();
            });
        }

        // Botones de exportación
        const btnExportarExcel = document.getElementById('btnExportExcel');
        const btnExportarPDF = document.getElementById('btnExportPDF');

        if (btnExportarExcel) {
            btnExportarExcel.addEventListener('click', () => this.exportarExcel());
        }

        if (btnExportarPDF) {
            btnExportarPDF.addEventListener('click', () => this.exportarPDF());
        }

        // Filtro de estado
        const filtroEstado = document.getElementById('filtroEstado');
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => this.aplicarFiltro());
        }

        // Validación en tiempo real
        const rentaImponible = document.getElementById('rentaImponible');
        const porcentaje = document.getElementById('porcentaje');

        if (rentaImponible) {
            rentaImponible.addEventListener('input', (e) => {
                this.validarMonto(e);
                // Quitar llamada a actualizarCardsResumen aquí
            });
        }

        if (porcentaje) {
            porcentaje.addEventListener('change', (e) => {
                this.validarPorcentaje(e);
                // Quitar llamada a actualizarCardsResumen aquí
            });
        }
    }

    setupCurrentYear() {
        const yearInput = document.getElementById('anio');
        if (yearInput && !yearInput.value) {
            yearInput.value = new Date().getFullYear().toString();
        }
    }

    async loadTrabajadores() {
        try {
            console.log('Cargando trabajadores...');
            this.trabajadores = await window.electronAPI.getTrabajadores();
            console.log(`${this.trabajadores?.length ?? 0} trabajadores cargados`);
            const btnCalcular = document.getElementById('btnCalcularUtilidades');
            if (!this.trabajadores || this.trabajadores.length === 0) {
                this.mostrarMensaje('No hay trabajadores registrados. No se puede calcular utilidades.', 'error');
                if (btnCalcular) btnCalcular.disabled = true;
            } else {
                if (btnCalcular) btnCalcular.disabled = false;
            }
            this.actualizarFiltroTrabajadores();
        } catch (error) {
            console.error('Error al cargar trabajadores:', error);
            this.mostrarMensaje('Error al cargar los trabajadores', 'error');
            const btnCalcular = document.getElementById('btnCalcularUtilidades');
            if (btnCalcular) btnCalcular.disabled = true;
        }
    }

    actualizarFiltroTrabajadores() {
        // Esta función ya no es necesaria con el nuevo diseño
        // pero la mantenemos para evitar errores de referencia
        console.log('Filtro de trabajadores no necesario en el nuevo diseño');
    }

    validarMonto(event) {
        const valor = event.target.value;
        const numero = parseFloat(valor);

        if (isNaN(numero) || numero <= 0) {
            event.target.classList.add('campo-error');
        } else {
            event.target.classList.remove('campo-error');
        }
    }

    validarPorcentaje(event) {
        const valor = event.target.value;
        const numero = parseFloat(valor);

        if (!valor || isNaN(numero) || numero <= 0 || numero > 100) {
            event.target.classList.add('campo-error');
        } else {
            event.target.classList.remove('campo-error');
        }
    }

    async calcularUtilidades() {
        try {
            console.log('Click en Calcular Utilidades');
            this.mostrarLoading(true);

            // Mostrar las secciones SIEMPRE al hacer click
            const resumenSection = document.getElementById('resumenSection');
            const tablaSection = document.getElementById('tablaSection');
            if (resumenSection) resumenSection.style.display = 'block';
            if (tablaSection) tablaSection.style.display = 'block';

            // Actualizar cards de resumen con los valores actuales del formulario
            this.actualizarCardsResumen();

            // Validar existencia de inputs
            const rentaInput = document.getElementById('rentaImponible');
            const porcentajeInput = document.getElementById('porcentaje');
            if (!rentaInput || !porcentajeInput) {
                console.error('No se encontraron los inputs rentaImponible o porcentaje');
                this.mostrarMensaje('Error interno: Inputs no encontrados', 'error');
                this.mostrarLoading(false);
                return;
            }

            // Si no hay trabajadores, muestra mensaje y valores en cero
            if (!this.trabajadores || this.trabajadores.length === 0) {
                console.warn('No hay trabajadores cargados');
                this.mostrarMensaje('No hay trabajadores registrados. No se puede calcular utilidades.', 'error');
                this.actualizarResumen({
                    montoTotal: 0,
                    montoPorDias: 0,
                    montoPorSueldos: 0,
                    totalDistribuido: 0,
                    diferencia: 0,
                    trabajadoresElegibles: 0,
                    trabajadoresConTope: 0
                }, {
                    montorenta: 0,
                    porcentaje: 0
                });
                this.actualizarTabla([]);
                this.mostrarLoading(false);
                return;
            }

            // Validar datos del formulario
            const datosFormulario = this.obtenerDatosFormulario();
            console.log('Datos del formulario:', datosFormulario);
            if (!this.validarFormulario(datosFormulario)) {
                console.warn('Formulario no válido');
                this.actualizarResumen({
                    montoTotal: 0,
                    montoPorDias: 0,
                    montoPorSueldos: 0,
                    totalDistribuido: 0,
                    diferencia: 0,
                    trabajadoresElegibles: 0,
                    trabajadoresConTope: 0
                }, datosFormulario);
                this.actualizarTabla([]);
                this.mostrarLoading(false);
                return;
            }

            // Limpiar secciones antes de mostrar nuevos resultados
            if (resumenSection) resumenSection.querySelectorAll('.card-value').forEach(card => card.textContent = '');
            const tbody = document.getElementById('tablaUtilidades');
            if (tbody) tbody.innerHTML = '';

            console.log('Calculando utilidades con datos:', datosFormulario);

            // Obtener trabajadores elegibles
            const trabajadoresElegibles = await this.obtenerTrabajadoresElegibles(datosFormulario.year);
            console.log('Trabajadores elegibles:', trabajadoresElegibles);
            if (!Array.isArray(trabajadoresElegibles) || trabajadoresElegibles.length === 0) {
                console.warn('No se encontraron trabajadores elegibles');
                this.mostrarMensaje('No se encontraron trabajadores elegibles para el período seleccionado', 'error');
                this.actualizarResumen({
                    montoTotal: 0,
                    montoPorDias: 0,
                    montoPorSueldos: 0,
                    totalDistribuido: 0,
                    diferencia: 0,
                    trabajadoresElegibles: 0,
                    trabajadoresConTope: 0
                }, datosFormulario);
                this.actualizarTabla([]);
                this.mostrarLoading(false);
                return;
            }

            // Calcular días laborados y montos
            const calculos = this.realizarCalculos(trabajadoresElegibles, datosFormulario);
            console.log('Cálculos realizados:', calculos);

            // Guardar cálculos
            this.utilidadesCalculadas = calculos.distribuciones;
            this.lastCalculation = {
                ...datosFormulario,
                totales: calculos.totales,
                fecha: new Date()
            };

            // Mostrar secciones explícitamente (asegura que se vean)
            if (resumenSection) resumenSection.style.display = 'block';
            if (tablaSection) tablaSection.style.display = 'block';

            // Actualizar interfaz
            this.actualizarResumen(calculos.totales, datosFormulario);
            this.actualizarTabla(calculos.distribuciones);

            this.mostrarMensaje('Utilidades calculadas exitosamente', 'exito');
            console.log('Resumen:', calculos.totales);
            console.log('Distribuciones:', calculos.distribuciones);

        } catch (error) {
            console.error('Error al calcular utilidades:', error);
            this.mostrarMensaje('Error al calcular las utilidades', 'error');
        } finally {
            this.mostrarLoading(false);
        }
    }

    obtenerDatosFormulario() {
        return {
            empresa: document.getElementById('empresa').value,
            year: parseInt(document.getElementById('anio').value),
            montorenta: parseFloat(document.getElementById('rentaImponible').value),
            porcentaje: parseFloat(document.getElementById('porcentaje').value)
        };
    }

    validarFormulario(datos) {
        const errores = [];

        if (!datos.empresa) errores.push('La empresa es requerida');
        if (!datos.year || datos.year < 2000 || datos.year > new Date().getFullYear()) {
            errores.push('El año debe estar entre 2000 y el año actual');
        }
        if (!datos.montorenta || datos.montorenta <= 0) {
            errores.push('El monto de renta debe ser mayor a 0');
        }
        if (!datos.porcentaje || datos.porcentaje <= 0 || datos.porcentaje > 100) {
            errores.push('El porcentaje debe estar entre 1 y 100');
        }

        if (errores.length > 0) {
            this.mostrarMensaje(errores.join('. '), 'error');
            return false;
        }

        return true;
    }

    async obtenerTrabajadoresElegibles(year) {
        // Filtrar trabajadores que estuvieron activos durante el año
        const fechaInicio = new Date(year, 0, 1); // 1 enero
        const fechaFin = new Date(year, 11, 31); // 31 diciembre

        return this.trabajadores.filter(trabajador => {
            // Trabajador debe estar activo o haber cesado después del inicio del año
            if (trabajador.estado === 'inactivo' && trabajador.fecha_cese) {
                const fechaCese = new Date(trabajador.fecha_cese);
                if (fechaCese < fechaInicio) {
                    return false; // Cesó antes del año consultado
                }
            }

            // Trabajador debe haber ingresado antes o durante el año
            if (trabajador.fecha_ingreso) {
                const fechaIngreso = new Date(trabajador.fecha_ingreso);
                if (fechaIngreso > fechaFin) {
                    return false; // Ingresó después del año consultado
                }
            }

            return true;
        });
    }

    realizarCalculos(trabajadores, datos) {
        const montoTotal = datos.montorenta * (datos.porcentaje / 100);
        const montoPorDias = montoTotal * 0.5;
        const montoPorSueldos = montoTotal * 0.5;

        let totalDiasLaborados = 0;
        let totalSueldosAnuales = 0;

        // Calcular totales para proporciones
        trabajadores.forEach(trabajador => {
            const diasLaborados = this.calcularDiasLaborados(trabajador, datos.year);
            const sueldoAnual = this.calcularSueldoAnual(trabajador, datos.year);

            totalDiasLaborados += diasLaborados;
            totalSueldosAnuales += sueldoAnual;
        });

        // Calcular distribución individual
        const distribuciones = trabajadores.map(trabajador => {
            const diasLaborados = this.calcularDiasLaborados(trabajador, datos.year);
            const sueldoAnual = this.calcularSueldoAnual(trabajador, datos.year);

            // Proporción por días
            const proporcionDias = totalDiasLaborados > 0 ? diasLaborados / totalDiasLaborados : 0;
            const montoPorDiasIndividual = montoPorDias * proporcionDias;

            // Proporción por sueldo
            const proporcionSueldo = totalSueldosAnuales > 0 ? sueldoAnual / totalSueldosAnuales : 0;
            const montoPorSueldoIndividual = montoPorSueldos * proporcionSueldo;

            // Total antes del tope
            const totalSinTope = montoPorDiasIndividual + montoPorSueldoIndividual;

            // Aplicar tope de 18 sueldos
            const topeSueldos = trabajador.sueldo * 18;
            const montoFinal = Math.min(totalSinTope, topeSueldos);
            const topeAplicado = totalSinTope > topeSueldos;

            return {
                id_trabajador: trabajador.id_trabajador,
                nombres: trabajador.nombres,
                apellidos: trabajador.apellidos,
                cargo: trabajador.cargo || 'No especificado',
                sueldo: trabajador.sueldo,
                diasLaborados,
                sueldoAnual,
                montoPorDias: montoPorDiasIndividual,
                montoPorSueldo: montoPorSueldoIndividual,
                totalSinTope,
                topeSueldos,
                montoFinal,
                topeAplicado
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
            trabajadoresConTope: distribuciones.filter(d => d.topeAplicado).length
        };

        return { distribuciones, totales };
    }

    calcularDiasLaborados(trabajador, year) {
        const fechaInicio = new Date(year, 0, 1);
        const fechaFin = new Date(year, 11, 31);

        // Fecha de ingreso efectiva (la mayor entre ingreso real y inicio del año)
        let inicioEfectivo = fechaInicio;
        if (trabajador.fecha_ingreso) {
            const fechaIngreso = new Date(trabajador.fecha_ingreso);
            if (fechaIngreso > fechaInicio) {
                inicioEfectivo = fechaIngreso;
            }
        }

        // Fecha de cese efectiva (la menor entre cese real y fin del año)
        let finEfectivo = fechaFin;
        if (trabajador.fecha_cese && trabajador.estado === 'inactivo') {
            const fechaCese = new Date(trabajador.fecha_cese);
            if (fechaCese < fechaFin) {
                finEfectivo = fechaCese;
            }
        }

        // Calcular días laborados
        const diffTime = finEfectivo - inicioEfectivo;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio

        return Math.max(0, diffDays);
    }

    calcularSueldoAnual(trabajador, year) {
        const diasLaborados = this.calcularDiasLaborados(trabajador, year);
        const sueldoDiario = trabajador.sueldo / 30; // Asumiendo mes de 30 días
        return sueldoDiario * diasLaborados;
    }

    actualizarResumen(totales, datos) {
        // Mostrar sección de resumen
        const resumenSection = document.getElementById('resumenSection');
        if (resumenSection) {
            resumenSection.style.display = 'block';
        }

        // Renta neta imponible
        const rentaImponibleEl = document.getElementById('cardRentaImponible');
        if (rentaImponibleEl) {
            rentaImponibleEl.textContent = `S/ ${datos.montorenta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        }

        // Porcentaje aplicado
        const porcentajeEl = document.getElementById('cardPorcentaje');
        if (porcentajeEl) {
            porcentajeEl.textContent = `${datos.porcentaje}%`;
        }

        // Total a repartir
        const totalRepartirEl = document.getElementById('cardTotalRepartir');
        if (totalRepartirEl) {
            totalRepartirEl.textContent = `S/ ${totales.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        }

        // Número de trabajadores
        const numTrabajadoresEl = document.getElementById('cardNumTrabajadores');
        if (numTrabajadoresEl) {
            numTrabajadoresEl.textContent = totales.trabajadoresElegibles.toString();
        }
    }

    actualizarCardsResumen() {
        const rentaImponibleEl = document.getElementById('cardRentaImponible');
        const porcentajeEl = document.getElementById('cardPorcentaje');
        const totalRepartirEl = document.getElementById('cardTotalRepartir');

        const rentaImponible = parseFloat(document.getElementById('rentaImponible').value) || 0;
        const porcentaje = parseFloat(document.getElementById('porcentaje').value) || 0;

        if (rentaImponibleEl) {
            rentaImponibleEl.textContent = `S/ ${rentaImponible.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        }
        if (porcentajeEl) {
            porcentajeEl.textContent = `${porcentaje}%`;
        }
        if (totalRepartirEl) {
            const total = rentaImponible * (porcentaje / 100);
            totalRepartirEl.textContent = `S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        }
    }

    actualizarTabla(distribuciones) {
        const tablaSection = document.getElementById('tablaSection');
        if (tablaSection) {
            tablaSection.style.display = 'block';
        }

        const tbody = document.querySelector('#tablaUtilidades');
        if (!tbody) return;

        tbody.innerHTML = '';

        distribuciones.forEach(distribucion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="trabajador-info">
                        <div class="trabajador-nombre">${distribucion.nombres} ${distribucion.apellidos}</div>
                        <div class="trabajador-cargo">${distribucion.cargo}</div>
                    </div>
                </td>
                <td class="monto">S/ ${distribucion.montoFinal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
            `;
            tbody.appendChild(row);
        });

        this.actualizarTotalesTabla(distribuciones);
    }

    actualizarTotalesTabla(distribuciones) {
        const totalDistribuidoTabla = document.getElementById('totalDistribucion');
        const diferenciaTabla = document.getElementById('diferencia');

        if (totalDistribuidoTabla && this.lastCalculation) {
            totalDistribuidoTabla.textContent = `S/ ${this.lastCalculation.totales.totalDistribuido.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
        }

        if (diferenciaTabla && this.lastCalculation) {
            const diferencia = this.lastCalculation.totales.diferencia;
            diferenciaTabla.textContent = `S/ ${Math.abs(diferencia).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
            
            if (diferencia > 0) {
                diferenciaTabla.className = 'total-value diferencia';
            } else if (diferencia < 0) {
                diferenciaTabla.className = 'total-value diferencia negativa';
            } else {
                diferenciaTabla.className = 'total-value';
            }
        }
    }

    aplicarFiltro() {
        const filtro = document.getElementById('filtroEstado');
        if (!filtro) return;

        const valorFiltro = filtro.value;
        const tbody = document.querySelector('#tablaUtilidades');
        
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach((row) => {
            // Por ahora mostramos todos, ya que todos están en estado "calculado"
            if (valorFiltro === 'todos' || valorFiltro === 'calculado') {
                row.style.display = '';
            } else {
                row.style.display = '';
            }
        });
    }

    async exportarExcel() {
        if (!this.utilidadesCalculadas.length) {
            this.mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        try {
            const datos = {
                configuracion: this.lastCalculation,
                distribuciones: this.utilidadesCalculadas
            };

            await window.electronAPI.exportarUtilidadesExcel(datos);
            this.mostrarMensaje('Archivo Excel exportado exitosamente', 'exito');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            this.mostrarMensaje('Error al exportar a Excel', 'error');
        }
    }

    async exportarPDF() {
        if (!this.utilidadesCalculadas.length) {
            this.mostrarMensaje('No hay datos para exportar', 'error');
            return;
        }

        try {
            const datos = {
                configuracion: this.lastCalculation,
                distribuciones: this.utilidadesCalculadas
            };

            await window.electronAPI.exportarUtilidadesPDF(datos);
            this.mostrarMensaje('Archivo PDF exportado exitosamente', 'exito');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            this.mostrarMensaje('Error al exportar a PDF', 'error');
        }
    }

    mostrarLoading(mostrar) {
        const container = document.querySelector('.utilidades-container');
        const btnCalcular = document.getElementById('btnCalcularUtilidades');

        if (mostrar) {
            if (container) container.classList.add('loading');
            if (btnCalcular) {
                btnCalcular.disabled = true;
                btnCalcular.innerHTML = '⏳ Calculando...';
            }
        } else {
            if (container) container.classList.remove('loading');
            if (btnCalcular) {
                btnCalcular.disabled = false;
                btnCalcular.innerHTML = '🧮 Calcular Utilidades';
            }
        }
    }

    mostrarMensaje(mensaje, tipo) {
        // Remover mensajes anteriores
        const mensajesAnteriores = document.querySelectorAll('.mensaje-error, .mensaje-exito');
        mensajesAnteriores.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const div = document.createElement('div');
        div.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
        div.textContent = mensaje;
        document.body.appendChild(div);

        // Remover después de 5 segundos
        setTimeout(() => {
            div.remove();
        }, 5000);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando módulo de Utilidades...');
    window.utilidadesManager = new UtilidadesManager();
});

// Expón la clase para reinicialización manual desde dashboard.js
window.UtilidadesManager = UtilidadesManager;


// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando módulo de Utilidades...');
    window.utilidadesManager = new UtilidadesManager();
});

// Expón la clase para reinicialización manual desde dashboard.js
window.UtilidadesManager = UtilidadesManager;
