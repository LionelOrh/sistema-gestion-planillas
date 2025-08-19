
// Variables globales
let trabajadorActual = null;
let conceptos = [];

document.addEventListener('DOMContentLoaded', function () {
    inicializarFechas();
    configurarEventos();
    cargarTrabajadores();

    const regimenSelect = document.getElementById('regimen');
    const codigoInput = document.getElementById('regimen-codigo');
    const nombreInput = document.getElementById('regimen-nombre');

    function actualizarRegimenInputs() {
        if (regimenSelect && codigoInput && nombreInput) {
            const valor = regimenSelect.value;
            const nombre = regimenSelect.selectedOptions[0].dataset.nombre || '';
            codigoInput.value = valor;
            nombreInput.value = nombre;
        }
    }

    if (regimenSelect) {
        regimenSelect.addEventListener('change', actualizarRegimenInputs);
        // Inicializa al cargar
        actualizarRegimenInputs();
    }
});

function inicializarFechas() {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];

    document.getElementById('f-registro').value = fechaStr;
    document.getElementById('f-ingreso').value = fechaStr;
    document.getElementById('fecha-inicio').value = fechaStr;
    document.getElementById('fecha-fin').value = fechaStr;

    // Establecer fechas de creación y modificación
    document.getElementById('creado').value = fechaStr + ' ' + hoy.toTimeString().slice(0, 8);
    document.getElementById('modificado').value = fechaStr + ' ' + hoy.toTimeString().slice(0, 8);
}

function configurarEventos() {
    // Eventos para cálculos automáticos
    document.getElementById('rem-basica').addEventListener('input', calcularGratificacion);
    document.getElementById('periodo-meses').addEventListener('input', calcularGratificacion);
    document.getElementById('dias-lab').addEventListener('input', calcularGratificacion);
    document.getElementById('faltas').addEventListener('input', calcularGratificacion);

    // Evento para selección de trabajador
    document.getElementById('trabajador').addEventListener('change', seleccionarTrabajador);

    // Evento para tipo de cambio automático
    document.getElementById('moneda').addEventListener('change', actualizarTipoCambio);
    // ...existing code...
    // ...existing code...

}

function cargarTrabajadores() {
    const trabajadores = [
        { id: '001', nombre: 'JUAN PÉREZ GARCÍA', remBasica: 1025 },
        { id: '002', nombre: 'MARÍA LÓPEZ SILVA', remBasica: 1200 },
        { id: '003', nombre: 'CARLOS MENDOZA RUIZ', remBasica: 950 },
        { id: '004', nombre: 'ANA TORRES VEGA', remBasica: 1100 }
    ];

    const select = document.getElementById('trabajador');
    trabajadores.forEach(trabajador => {
        const option = document.createElement('option');
        option.value = trabajador.id;
        option.textContent = `${trabajador.id} - ${trabajador.nombre}`;
        option.dataset.nombre = trabajador.nombre;
        option.dataset.remBasica = trabajador.remBasica;
        select.appendChild(option);
    });
}

function seleccionarTrabajador() {
    const select = document.getElementById('trabajador');
    const selectedOption = select.selectedOptions[0];

    if (selectedOption && selectedOption.value) {
        document.getElementById('trabajador-nombre').value = selectedOption.dataset.nombre;
        document.getElementById('rem-basica').value = selectedOption.dataset.remBasica;

        // Establecer datos por defecto
        document.getElementById('periodo-meses').value = 6;
        document.getElementById('dias-lab').value = 180;
        document.getElementById('faltas').value = 0;

        calcularGratificacion();
    }
}

function actualizarTipoCambio() {
    const moneda = document.getElementById('moneda').value;
    if (moneda === 'USD') {
        document.getElementById('t-cambio').value = '3.750';
    } else {
        document.getElementById('t-cambio').value = '1.000';
    }
}

function calcularGratificacion() {
    const remBasica = parseFloat(document.getElementById('rem-basica').value) || 0;
    const periodoMeses = parseFloat(document.getElementById('periodo-meses').value) || 0;
    const diasLab = parseFloat(document.getElementById('dias-lab').value) || 0;
    const faltas = parseFloat(document.getElementById('faltas').value) || 0;

    if (remBasica === 0) return;

    // Cálculos principales
    const remComputable = remBasica;
    const remCompMeses = (remComputable / 6) * periodoMeses;
    const desctoFaltas = (remComputable / 30) * faltas;
    const gratifNeta = remCompMeses - desctoFaltas;
    const bonifExtr = gratifNeta * 0.09; // 9%
    const totalGratif = gratifNeta + bonifExtr;

    // Actualizar campos calculados
    document.getElementById('rem-computable').value = remComputable.toFixed(2);
    document.getElementById('total-ingresos').value = remBasica.toFixed(2);
    document.getElementById('rem-comp-meses').value = remCompMeses.toFixed(2);
    document.getElementById('descto-faltas').value = desctoFaltas.toFixed(2);
    document.getElementById('rem-comp-30').value = (remComputable / 30).toFixed(2);
    document.getElementById('gratif-neta').value = gratifNeta.toFixed(2);
    document.getElementById('total-gratif-desc').value = gratifNeta.toFixed(2);
    document.getElementById('bonif-extr').value = bonifExtr.toFixed(2);
    document.getElementById('gratif-9').value = bonifExtr.toFixed(2);
    document.getElementById('total-9-meses').value = (bonifExtr * 9).toFixed(2);
    document.getElementById('gratif-bonif').value = totalGratif.toFixed(2);
    document.getElementById('total-gratif').value = totalGratif.toFixed(2);

    // Actualizar fecha de modificación
    const ahora = new Date();
    document.getElementById('modificado').value = ahora.toISOString().split('T')[0] + ' ' + ahora.toTimeString().slice(0, 8);
}

// Funciones de botones
function guardarDatos() {
    const datos = {
        trabajador: document.getElementById('trabajador').value,
        remBasica: document.getElementById('rem-basica').value,
        gratificacion: document.getElementById('total-gratif').value
    };

    alert('Datos guardados correctamente\n\nTrabajador: ' + document.getElementById('trabajador-nombre').value + '\nGratificación: S/ ' + datos.gratificacion);
}

function verGraficos() {
    alert('Abriendo módulo de gráficos y reportes estadísticos...');
}

function generarReporte() {
    if (!document.getElementById('trabajador').value) {
        alert('Debe seleccionar un trabajador primero');
        return;
    }

    const trabajador = document.getElementById('trabajador-nombre').value;
    const gratificacion = document.getElementById('total-gratif').value;
    const periodo = document.getElementById('gratificaciones').value;

    alert(`Generando reporte de gratificación...\n\nTrabajador: ${trabajador}\nPeríodo: ${periodo} 2025\nMonto: S/ ${gratificacion}`);
}

function marcarFavorito() {
    alert('Registro marcado como favorito');
}

function eliminar() {
    if (confirm('¿Está seguro de eliminar este registro?')) {
        // Limpiar formulario
        document.getElementById('trabajador').value = '';
        document.getElementById('trabajador-nombre').value = '';
        document.getElementById('rem-basica').value = '0';
        calcularGratificacion();
        alert('Registro eliminado');
    }
}

function herramientas() {
    alert('Abriendo herramientas adicionales del sistema...');
}

// Función para agregar conceptos (simulada)
function agregarConcepto() {
    const conceptosContent = document.getElementById('conceptos-content');
    const concepto = {
        codigo: '001',
        concepto: 'ASIGNACIÓN FAMILIAR',
        importe: 102.00
    };

    const div = document.createElement('div');
    div.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 2fr 1fr 50px; gap: 10px; padding: 5px; border-bottom: 1px solid #ddd;">
                    <span>${concepto.codigo}</span>
                    <span>${concepto.concepto}</span>
                    <span>S/ ${concepto.importe.toFixed(2)}</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">✕</button>
                </div>
            `;
    conceptosContent.appendChild(div);
}

// Simular clic en búsqueda
document.querySelector('.search-icon').addEventListener('click', function () {
    alert('Abriendo búsqueda avanzada de trabajadores...');
});
