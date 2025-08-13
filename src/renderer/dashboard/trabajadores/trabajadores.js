// Lógica simple para mostrar trabajadores
class TrabajadoresManager {
  constructor() {
    this.init();
    setTimeout(() => {
      this.initModal();
    }, 100);
  }

  async init() {
    await this.cargarTrabajadores();
  }

  async initModal() {
    // Referencias del modal
    this.modal = document.getElementById('modalAgregarTrabajador');
    this.btnAgregar = document.getElementById('btnAgregarTrabajador');
    this.btnCerrar = document.getElementById('btnCerrarModal');
    this.btnCancelar = document.getElementById('btnCancelar');
    this.form = document.getElementById('formTrabajador');

    // Cargar ubigeos después de que el modal esté referenciado
    await this.cargarUbigeos();

    // Event listeners
    if (this.btnAgregar) {
      this.btnAgregar.addEventListener('click', () => this.abrirModal());
    }

    if (this.btnCerrar) {
      this.btnCerrar.addEventListener('click', () => this.cerrarModal());
    }

    if (this.btnCancelar) {
      this.btnCancelar.addEventListener('click', () => this.cerrarModal());
    }

    // Cerrar modal al hacer clic fuera
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.cerrarModal();
        }
      });
    }

    // Manejar pestañas
    this.initTabs();

    // Manejar validación de campos
    this.initValidation();

    // Manejar envío del formulario
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.guardarTrabajador(e));
    }
  }

  initValidation() {
    // Agregar validación individual para cada campo
    const allFields = this.modal.querySelectorAll('input, select');

    allFields.forEach(field => {
      // Marcar como touched cuando el usuario interactúa
      field.addEventListener('blur', () => {
        field.classList.add('field-touched');
      });

      // Para selects, también marcar como touched al cambiar
      if (field.tagName === 'SELECT') {
        field.addEventListener('change', () => {
          field.classList.add('field-touched');
        });
      }

      // Para inputs, marcar como touched al escribir
      if (field.tagName === 'INPUT') {
        field.addEventListener('input', () => {
          field.classList.add('field-touched');
        });
      }
    });
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Remover clase active de todos los botones y contenidos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Agregar clase active al botón y contenido seleccionado
        button.classList.add('active');
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  abrirModal() {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
      
      // Asegurar que ningún campo tenga la clase field-touched
      const allFields = this.modal.querySelectorAll('input, select');
      allFields.forEach(field => {
        field.classList.remove('field-touched');
      });
      
      // Enfocar el primer input
      const firstInput = this.modal.querySelector('input, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  cerrarModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = ''; // Restaurar scroll del body
      
      // Limpiar formulario
      if (this.form) {
        this.form.reset();
        
        // Resetear clases de validación individual
        const allFields = this.form.querySelectorAll('input, select');
        allFields.forEach(field => {
          field.classList.remove('field-touched');
          field.style.borderColor = '';
        });
      }
      
      // Volver a la primera pestaña
      const firstTab = document.querySelector('.tab-button[data-tab="personal"]');
      const firstContent = document.getElementById('tab-personal');
      if (firstTab && firstContent) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        firstTab.classList.add('active');
        firstContent.classList.add('active');
      }
    }
  }

  async guardarTrabajador(e) {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = new FormData(this.form);
    const trabajadorData = Object.fromEntries(formData);
    
    console.log('Datos del trabajador a guardar:', trabajadorData);
    
    try {
      // Aquí irá la lógica para guardar en la base de datos
      // Por ahora solo mostramos los datos en consola
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar mensaje de éxito
      this.mostrarExito('Trabajador agregado exitosamente');
      
      // Cerrar modal
      this.cerrarModal();
      
      // Recargar tabla
      await this.cargarTrabajadores();
      
    } catch (error) {
      console.error('Error al guardar trabajador:', error);
      this.mostrarError('Error al guardar el trabajador: ' + error.message);
    }
  }

  mostrarExito(mensaje) {
    const exitoDiv = document.createElement('div');
    exitoDiv.className = 'exito-toast';
    exitoDiv.textContent = mensaje;
    exitoDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
    `;
    
    document.body.appendChild(exitoDiv);
    
    setTimeout(() => {
      exitoDiv.remove();
    }, 3000);
  }

  async cargarTrabajadores() {
    try {
      const trabajadores = await window.electronAPI.obtenerTrabajadores();
      this.renderizarTabla(trabajadores);
    } catch (error) {
      this.mostrarError('Error al cargar los trabajadores: ' + error.message);
    }
  }

  renderizarTabla(trabajadores) {
    const tbody = document.querySelector('.trabajadores-tabla tbody');
    if (!tbody) {
      console.error('No se encontró el tbody de la tabla');
      return;
    }

    tbody.innerHTML = '';

    if (trabajadores.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: #7f8c8d;">
            No se encontraron trabajadores
          </td>
        </tr>
      `;
      return;
    }

    trabajadores.forEach(trabajador => {
      const fila = document.createElement('tr');
      const nombreCompleto = `${trabajador.nombres} ${trabajador.apellidos}`;
      
      fila.innerHTML = `
        <td>
          <div class="trabajador-info">
            <div class="trabajador-nombre">${nombreCompleto}</div>
            <div class="trabajador-correo">${trabajador.correo}</div>
          </div>
        </td>
        <td>${trabajador.numero_documento}</td>
        <td>${trabajador.area}</td>
        <td>${trabajador.cargo}</td>
        <td>S/ ${Number(trabajador.sueldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>
          <span class="estado-badge ${trabajador.estado.toLowerCase()}">
            ${trabajador.estado}
          </span>
        </td>
        <td>
          <button class="btn-accion btn-editar" data-id="${trabajador.id_trabajador}">Editar</button>
          <button class="btn-accion btn-eliminar" data-id="${trabajador.id_trabajador}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
    
  }

  mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = mensaje;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  async cargarUbigeos() {
    const departamentoSelect = document.getElementById('departamento');
    const provinciaSelect = document.getElementById('provincia');
    const distritoSelect = document.getElementById('distrito');

    if (!departamentoSelect || !provinciaSelect || !distritoSelect) {
      return;
    }

    let departamentos = [];
    let provincias = {};
    let distritos = {};

    try {
        // Cargar datos desde los archivos JSON
        const departamentosResponse = await fetch('../../json/departamentos.json');
        const provinciasResponse = await fetch('../../json/provincias.json');
        const distritosResponse = await fetch('../../json/distritos.json');

        if (!departamentosResponse.ok || !provinciasResponse.ok || !distritosResponse.ok) {
            throw new Error(`Error al cargar archivos JSON. Estados: Departamentos: ${departamentosResponse.status}, Provincias: ${provinciasResponse.status}, Distritos: ${distritosResponse.status}`);
        }

        departamentos = await departamentosResponse.json();
        provincias = await provinciasResponse.json();
        distritos = await distritosResponse.json();
        
    } catch (error) {
        console.error('Error al cargar los datos de ubigeos:', error);
        return;
    }

    // Poblar el select de departamentos
    if (departamentos.length > 0) {
        departamentos.forEach(departamento => {
            const option = document.createElement('option');
            option.value = departamento.id_ubigeo;
            option.textContent = departamento.nombre_ubigeo;
            departamentoSelect.appendChild(option);
        });
    }

    // Manejar el cambio de departamento
    departamentoSelect.addEventListener('change', () => {
        provinciaSelect.innerHTML = '<option value="">Seleccionar...</option>';
        distritoSelect.innerHTML = '<option value="">Seleccionar...</option>';
        distritoSelect.disabled = true;

        const selectedDepartamento = departamentoSelect.value;
        if (selectedDepartamento && provincias[selectedDepartamento]) {
            const provinciasDelDepartamento = provincias[selectedDepartamento];
            provinciasDelDepartamento.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.id_ubigeo;
                option.textContent = provincia.nombre_ubigeo;
                provinciaSelect.appendChild(option);
            });
            provinciaSelect.disabled = false;
        } else {
            provinciaSelect.disabled = true;
        }
    });

    // Manejar el cambio de provincia
    provinciaSelect.addEventListener('change', () => {
        distritoSelect.innerHTML = '<option value="">Seleccionar...</option>';

        const selectedProvincia = provinciaSelect.value;
        if (selectedProvincia && distritos[selectedProvincia]) {
            const distritosDelaProvincia = distritos[selectedProvincia];
            distritosDelaProvincia.forEach(distrito => {
                const option = document.createElement('option');
                option.value = distrito.id_ubigeo;
                option.textContent = distrito.nombre_ubigeo;
                distritoSelect.appendChild(option);
            });
            distritoSelect.disabled = false;
        } else {
            distritoSelect.disabled = true;
        }
    });
  }
}

// Hacer la clase disponible globalmente
window.TrabajadoresManager = TrabajadoresManager;

// Inicializar cuando se carga la vista de trabajadores
if (document.querySelector('.trabajadores-gestion')) {
  new TrabajadoresManager();
}
