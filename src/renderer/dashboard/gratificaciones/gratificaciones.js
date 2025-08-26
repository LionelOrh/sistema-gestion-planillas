class GratificacionesManager {
    constructor() {
        this.init();
    }

    async init() {
        // Inicializa solo si el modo individual está visible
        const individualContent = document.getElementById('mode-individual-content');
        if (individualContent && !individualContent.classList.contains('hidden')) {
            await this.cargarTrabajadoresEnSelect();
        }

        const semesterSelect = document.getElementById('semester-select');
        const yearSelect = document.getElementById('year-select');
        const employeeSelect = document.getElementById('employee-select');

        const actualizarDatos = () => {
            const id = employeeSelect ? employeeSelect.value : '';
            if (id) this.mostrarDatosTrabajador(id);
        };

        if (semesterSelect) semesterSelect.addEventListener('change', actualizarDatos);
        if (yearSelect) yearSelect.addEventListener('change', actualizarDatos);

        // Listener para cambio de trabajador
        if (employeeSelect) {
            employeeSelect.addEventListener('change', (e) => {
                const id = e.target.value;
                this.mostrarDatosTrabajador(id);
            });
        }

        // Listeners para tabs y modalidad
        document.addEventListener('click', async (e) => {
            // Tabs
            if (e.target.classList.contains('tab-trigger')) {
                const tabTriggers = document.querySelectorAll('.tab-trigger');
                const tabContents = document.querySelectorAll('.tab-content');
                tabTriggers.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.add('hidden'));

                e.target.classList.add('active');
                const tabId = e.target.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                if (tabContent) tabContent.classList.remove('hidden');
            }

            const select = document.getElementById('employee-select');
            if (select) {
                select.addEventListener('change', (e) => {
                    const id = e.target.value;
                    this.mostrarDatosTrabajador(id);
                });
            }



            // Modalidad de cálculo
            if (e.target.closest('.mode-card')) {
                const selectedCard = e.target.closest('.mode-card');
                const mode = selectedCard.getAttribute('data-mode');
                const allCards = document.querySelectorAll('.mode-card');
                const allContents = document.querySelectorAll('.mode-content');
                allCards.forEach(card => card.classList.remove('active'));
                selectedCard.classList.add('active');
                allContents.forEach(content => content.classList.add('hidden'));
                const contentToShow = document.getElementById('mode-' + mode + '-content');
                if (contentToShow) {
                    contentToShow.classList.remove('hidden');
                    // Solo cargar trabajadores si es individual
                    // ...dentro del listener de modalidad...
                    if (mode === 'individual' || mode === 'massive') {
                        await this.cargarTrabajadoresEnSelect();
                    }
                }
            }
        });
    }
    calcularMesesDias(fechaIngreso, fechaCorte, semestre) {
        // Determina el inicio del semestre
        const anio = fechaCorte.slice(0, 4);
        let inicioSemestre;
        let finSemestre;
        if (semestre === '1') {
            // Julio: semestre de enero a junio
            inicioSemestre = `${anio}-01-01`;
            finSemestre = `${anio}-06-30`;
        } else {
            // Diciembre: semestre de julio a diciembre
            inicioSemestre = `${anio}-07-01`;
            finSemestre = `${anio}-12-31`;
        }

        // Fecha real de inicio para el cálculo
        const inicio = new Date(Math.max(new Date(fechaIngreso), new Date(inicioSemestre)));
        // La fecha de corte nunca puede ser después del fin del semestre
        const corte = new Date(fechaCorte) > new Date(finSemestre) ? new Date(finSemestre) : new Date(fechaCorte);

        // Si la fecha de ingreso es después de la fecha de corte, no hay gratificación
        if (inicio > corte) return { meses: 0, dias: 0 };

        // Sumar 1 día para incluir el último día del semestre
        const corteIncluido = new Date(corte);
        corteIncluido.setDate(corteIncluido.getDate() + 1);

        // Diferencia total en días
        const diffTime = corteIncluido - inicio;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Calcula meses completos y días adicionales
        const meses = Math.floor(diffDays / 30);
        const dias = diffDays % 30;

        return { meses, dias };
    }

    obtenerFechaCorteReal() {
        const semestre = document.getElementById('semester-select').value;
        const anio = document.getElementById('year-select').value;
        let fechaCorte;
        if (semestre === '1') {
            fechaCorte = `${anio}-06-30`;
        } else {
            fechaCorte = `${anio}-12-31`;
        }
        const hoy = new Date();
        const corte = new Date(fechaCorte);
        // Usa la menor entre la fecha de corte y hoy
        return hoy < corte ? hoy : corte;
    }


    async mostrarDatosTrabajador(id) {
        const datosRow = document.getElementById('datos-trabajador-row');
        datosRow.innerHTML = '';
        if (!id) return;
        try {
            const trabajador = await window.electronAPI.obtenerTrabajadorPorId(id);
            if (trabajador) {
                // Obtén la fecha de corte del select
                const fechaCorteReal = this.obtenerFechaCorteReal();
                const semestre = document.getElementById('semester-select').value;
                const { meses, dias } = this.calcularMesesDias(trabajador.fecha_ingreso, fechaCorteReal.toISOString().slice(0, 10), semestre);
                // Obtén sueldo base
                const sueldoBase = parseFloat(trabajador.sueldo) || 0;

                // Calcula gratificación proporcional
                const gratificacion = sueldoBase * ((meses + (dias / 30)) / 6);
                datosRow.innerHTML = `
        <div class="datos-row">
            <span><strong>Trabajador:</strong> ${trabajador.nombres} ${trabajador.apellidos}</span>
            <span><strong>Área:</strong> ${trabajador.area || '-'}</span>
            <span><strong>Sueldo base:</strong> S/ ${trabajador.sueldo || '-'}</span>
        </div>
        <div class="parametros-calculo">
            <h4>Parámetros de Cálculo</h4>
            <div class="parametros-row">
                <input type="text" placeholder="Meses Completos" value="${meses}" readonly>
                <input type="text" placeholder="Días Adicionales" value="${dias}" readonly>
                <input type="text" placeholder="Otros Conceptos (S/)" >
            </div>
            <hr>
            <div class="vista-previa-label">Vista Previa del Cálculo:</div>
            <div class="vista-previa-row">
                <div class="vista-card card-azul">
                    <div class="vista-title">Gratificación Proporcional</div>
                    <div class="vista-valor">S/ ${gratificacion.toFixed(2)}</div>

                    <div class="vista-desc">Periodo: ${meses}m y ${dias}d</div>
                </div>
                <div class="vista-card card-verde">
                    <div class="vista-title">Bonificación 9%</div>
                    <div class="vista-valor">S/ ----</div>
                    <div class="vista-desc">(9% sobre gratificación)</div>
                </div>
                <div class="vista-card card-morado">
                    <div class="vista-title">Total Bruto</div>
                    <div class="vista-valor">S/ ----</div>
                    <div class="vista-desc">(antes de descuentos)</div>
                </div>
            </div>
        </div>
    `;
            }
        } catch (error) {
            datosRow.innerHTML = '<span>Error al cargar datos</span>';
        }
    }

    // ...dentro de la clase GratificacionesManager...

    async cargarTrabajadoresEnSelect() {



        const select = document.getElementById('employee-select');
        let cantidad = 0;
        if (window.electronAPI && select) {
            try {
                const trabajadores = await window.electronAPI.obtenerTrabajadores();
                cantidad = trabajadores.length;
                select.innerHTML = '';
                // Opción por defecto
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Seleccione...';
                select.appendChild(defaultOption);
                // Opciones de trabajadores
                trabajadores.forEach(trabajador => {
                    const option = document.createElement('option');
                    option.value = trabajador.id_trabajador;
                    option.textContent = `${trabajador.nombres} ${trabajador.apellidos} - ${trabajador.numero_documento}`;
                    select.appendChild(option);
                });
            } catch (error) {
                select.innerHTML = '<option>Error al cargar trabajadores</option>';
            }
        }
        // Actualiza el mensaje en modo masivo
        const cantidadSpan = document.getElementById('masivo-cantidad');
        if (cantidadSpan) cantidadSpan.textContent = cantidad;
    }

}
window.GratificacionesManager = GratificacionesManager;

