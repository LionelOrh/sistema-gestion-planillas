// Lógica simple para mostrar trabajadores
class TrabajadoresManager {
  constructor() {
    this.modoEdicion = false;
    this.trabajadorEnEdicion = null;
    this.trabajadorIdDetalle = null;
    this.init();
    setTimeout(() => {
      this.initModal();
      this.initModalDetalle();
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
    
    // Cargar sistemas de pensión
    await this.cargarSistemasPension();

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

  abrirModal(trabajadorData = null) {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
      
      // Configurar modo edición o creación
      if (trabajadorData) {
        this.modoEdicion = true;
        this.trabajadorEnEdicion = trabajadorData;
        this.cargarDatosEnModal(trabajadorData);
        
        // Cambiar título del modal
        const modalTitle = this.modal.querySelector('.modal-header h2');
        if (modalTitle) {
          modalTitle.textContent = 'Editar Trabajador';
        }
        
        // Cambiar texto del botón
        const btnGuardar = this.modal.querySelector('.btn-guardar');
        if (btnGuardar) {
          btnGuardar.textContent = 'Actualizar Trabajador';
        }
      } else {
        this.modoEdicion = false;
        this.trabajadorEnEdicion = null;
        
        // Restaurar título del modal
        const modalTitle = this.modal.querySelector('.modal-header h2');
        if (modalTitle) {
          modalTitle.textContent = 'Agregar Nuevo Trabajador';
        }
        
        // Restaurar texto del botón
        const btnGuardar = this.modal.querySelector('.btn-guardar');
        if (btnGuardar) {
          btnGuardar.textContent = 'Guardar Trabajador';
        }
      }
      
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

  cargarDatosEnModal(trabajador) {
    try {
      console.log('Cargando datos del trabajador en modal:', trabajador);
      
      // Tab Personal
      this.setFieldValue('nombres', trabajador.nombres);
      this.setFieldValue('apellidos', trabajador.apellidos);
      this.setFieldValue('tipoDni', trabajador.tipo_dni);
      this.setFieldValue('numeroDocumento', trabajador.numero_documento);
      this.setFieldValue('fechaNacimiento', trabajador.fecha_nacimiento);
      this.setFieldValue('sexo', trabajador.sexo);
      this.setFieldValue('estadoCivil', trabajador.estado_civil);
      this.setFieldValue('nacionalidad', trabajador.nacionalidad);
      
      // Tab Contacto
      this.setFieldValue('direccion', trabajador.direccion);
      
      // Cargar ubigeos de forma secuencial
      this.setFieldValue('departamento', trabajador.departamento);
      
      // Esperar un momento para que se procesen los eventos y luego cargar provincia y distrito
      setTimeout(() => {
        // Disparar el evento change del departamento para cargar las provincias
        const departamentoSelect = document.getElementById('departamento');
        if (departamentoSelect && trabajador.departamento) {
          departamentoSelect.dispatchEvent(new Event('change'));
          
          // Después de un momento, establecer la provincia y disparar su evento
          setTimeout(() => {
            this.setFieldValue('provincia', trabajador.provincia);
            const provinciaSelect = document.getElementById('provincia');
            if (provinciaSelect && trabajador.provincia) {
              provinciaSelect.dispatchEvent(new Event('change'));
              
              // Finalmente establecer el distrito
              setTimeout(() => {
                this.setFieldValue('distrito', trabajador.distrito);
              }, 100);
            }
          }, 100);
        }
      }, 100);
      
      this.setFieldValue('telefono', trabajador.telefono);
      this.setFieldValue('correo', trabajador.correo);
      
      // Tab Laboral
      this.setFieldValue('tipoTrabajador', trabajador.tipo_trabajador);
      this.setFieldValue('cargo', trabajador.cargo);
      this.setFieldValue('area', trabajador.area);
      this.setFieldValue('fechaIngreso', trabajador.fecha_ingreso);
      this.setFieldValue('tipoContrato', trabajador.tipo_contrato);
      this.setFieldValue('sueldoBasico', trabajador.sueldo);
      this.setFieldValue('regimenLaboral', trabajador.regimen_laboral);
      this.setFieldValue('tipoJornada', trabajador.tipo_jornada);
      this.setFieldValue('turnos', trabajador.turnos);
      
      // Tab Financiero
      this.setFieldValue('banco', trabajador.banco);
      this.setFieldValue('numeroCuenta', trabajador.numero_cuenta);
      this.setFieldValue('cci', trabajador.cci);
      this.setFieldValue('sistemaPension', trabajador.id_sistema_pension);
      this.setFieldValue('numeroAfiliacion', trabajador.numero_afiliacion);
      
      console.log('Datos cargados exitosamente en el modal');
      
    } catch (error) {
      console.error('Error al cargar datos en el modal:', error);
      this.mostrarError('Error al cargar los datos del trabajador');
    }
  }
  
  setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== null && value !== undefined) {
      // Manejar fechas en formato ISO
      if (field.type === 'date' && typeof value === 'string') {
        // Si la fecha viene en formato ISO (con tiempo), extraer solo la fecha
        if (value.includes('T')) {
          field.value = value.split('T')[0]; // Obtener solo la parte de fecha (YYYY-MM-DD)
        } else {
          field.value = value;
        }
      } 
      // Manejar fechas que vienen como objeto Date
      else if (field.type === 'date' && value instanceof Date) {
        // Convertir Date object a formato YYYY-MM-DD
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        field.value = `${year}-${month}-${day}`;
      }
      // Para cualquier otro tipo de campo
      else {
        field.value = value;
      }
      
      console.log(`Campo ${fieldId} establecido con valor:`, field.value);
    } else if (field) {
      console.log(`Campo ${fieldId} no se pudo establecer - valor:`, value);
    } else {
      console.log(`Campo ${fieldId} no encontrado en el DOM`);
    }
  }

  cerrarModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = ''; // Restaurar scroll del body
      
      // Resetear modo edición
      this.modoEdicion = false;
      this.trabajadorEnEdicion = null;
      
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
      
      // Restaurar título y botón por defecto
      const modalTitle = this.modal.querySelector('.modal-header h2');
      if (modalTitle) {
        modalTitle.textContent = 'Agregar Nuevo Trabajador';
      }
      
      const btnGuardar = this.modal.querySelector('.btn-guardar');
      if (btnGuardar) {
        btnGuardar.textContent = 'Guardar Trabajador';
        btnGuardar.disabled = false; // Asegurar que el botón esté habilitado
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
    
    // Validar campos requeridos antes de enviar
    if (!this.validarCamposRequeridos()) {
      this.mostrarError('Por favor, complete todos los campos requeridos');
      return;
    }
    
    // Obtener datos del formulario
    const formData = new FormData(this.form);
    const trabajadorData = Object.fromEntries(formData);
    
    console.log('Datos del trabajador a guardar:', trabajadorData);
    
    // Mostrar loading - definir textoOriginal aquí para que esté disponible en finally
    const btnGuardar = document.querySelector('.btn-guardar');
    const textoOriginal = btnGuardar ? btnGuardar.textContent : '';
    
    try {
      if (btnGuardar) {
        btnGuardar.textContent = this.modoEdicion ? 'Actualizando...' : 'Guardando...';
        btnGuardar.disabled = true;
      }
      
      let resultado;
      
      if (this.modoEdicion && this.trabajadorEnEdicion) {
        // Actualizar trabajador existente
        resultado = await window.electronAPI.actualizarTrabajador(
          this.trabajadorEnEdicion.id_trabajador, 
          trabajadorData
        );
        this.mostrarExito('Trabajador actualizado exitosamente');
      } else {
        // Crear nuevo trabajador
        resultado = await window.electronAPI.crearTrabajador(trabajadorData);
        this.mostrarExito('Trabajador agregado exitosamente');
      }
      
      console.log('Resultado de la operación:', resultado);
      
      // Cerrar modal
      this.cerrarModal();
      
      // Recargar tabla
      await this.cargarTrabajadores();
      
    } catch (error) {
      console.error('Error al guardar trabajador:', error);
      const operacion = this.modoEdicion ? 'actualizar' : 'guardar';
      this.mostrarError(`Error al ${operacion} el trabajador: ` + error.message);
    } finally {
      // Restaurar botón
      const btnGuardar = document.querySelector('.btn-guardar');
      if (btnGuardar && textoOriginal) {
        btnGuardar.textContent = textoOriginal;
        btnGuardar.disabled = false;
      } else if (btnGuardar) {
        // Fallback si no hay textoOriginal
        btnGuardar.textContent = this.modoEdicion ? 'Actualizar Trabajador' : 'Guardar Trabajador';
        btnGuardar.disabled = false;
      }
    }
  }

  validarCamposRequeridos() {
    const camposRequeridos = [
      'nombres',
      'apellidos', 
      'numeroDocumento',
      'correo',
      'cargo',
      'area',
      'fechaIngreso',
      'sueldoBasico'
    ];
    
    let todosLlenos = true;
    
    camposRequeridos.forEach(campo => {
      const input = this.form.querySelector(`[name="${campo}"]`);
      if (!input || !input.value.trim()) {
        input?.classList.add('field-touched');
        todosLlenos = false;
      }
    });
    
    return todosLlenos;
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

  mostrarInfo(mensaje) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-toast';
    infoDiv.textContent = mensaje;
    infoDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3498db;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
    `;
    
    document.body.appendChild(infoDiv);
    
    setTimeout(() => {
      infoDiv.remove();
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
          <button class="btn-accion btn-detalle" data-id="${trabajador.id_trabajador}" title="Ver Detalle">👁️</button>
          <button class="btn-accion btn-editar" data-id="${trabajador.id_trabajador}">Editar</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
    
    // Agregar event listeners a los botones de acción
    this.initActionButtons();
    
  }

  initActionButtons() {
    const botonesDetalle = document.querySelectorAll('.btn-detalle');
    const botonesEditar = document.querySelectorAll('.btn-editar');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');

    botonesDetalle.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.mostrarDetalleTrabajador(id);
      });
    });

    botonesEditar.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.editarTrabajador(id);
      });
    });

    botonesEliminar.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.eliminarTrabajador(id);
      });
    });
  }

  async editarTrabajador(id) {
    try {
      console.log('Editando trabajador con ID:', id);
      
      // Mostrar loading en el botón mientras se cargan los datos
      const btnEditar = document.querySelector(`.btn-editar[data-id="${id}"]`);
      if (btnEditar) {
        const textoOriginal = btnEditar.textContent;
        btnEditar.textContent = 'Cargando...';
        btnEditar.disabled = true;
        
        setTimeout(() => {
          btnEditar.textContent = textoOriginal;
          btnEditar.disabled = false;
        }, 3000);
      }
      
      // Obtener los datos del trabajador
      const trabajador = await window.electronAPI.obtenerTrabajadorPorId(id);
      
      console.log('Datos del trabajador para editar:', trabajador);
      
      // Abrir modal en modo edición
      this.abrirModal(trabajador);
      
    } catch (error) {
      console.error('Error al obtener datos del trabajador:', error);
      this.mostrarError('Error al cargar los datos del trabajador: ' + error.message);
    }
  }

  async eliminarTrabajador(id) {
    if (confirm('¿Está seguro de que desea eliminar este trabajador?')) {
      try {
        console.log('Eliminando trabajador con ID:', id);
        
        // TODO: Implementar eliminación cuando esté disponible en el servicio
        this.mostrarInfo('Función de eliminación en desarrollo');
        
      } catch (error) {
        console.error('Error al eliminar trabajador:', error);
        this.mostrarError('Error al eliminar el trabajador: ' + error.message);
      }
    }
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

  async cargarSistemasPension() {
    const sistemaPensionSelect = document.getElementById('sistemaPension');

    if (!sistemaPensionSelect) {
      console.error('No se encontró el select de sistema de pensión');
      return;
    }

    try {
      console.log('Cargando sistemas de pensión...');
      
      // Mostrar indicador de carga
      sistemaPensionSelect.innerHTML = '<option value="">Cargando sistemas...</option>';
      sistemaPensionSelect.disabled = true;
      
      // Obtener los sistemas de pensión desde la base de datos
      const sistemas = await window.electronAPI.obtenerSistemasPension();
      
      console.log('Sistemas de pensión obtenidos:', sistemas);
      
      // Habilitar el select y limpiar opciones
      sistemaPensionSelect.disabled = false;
      sistemaPensionSelect.innerHTML = '<option value="">Seleccionar...</option>';
      
      // Agregar cada sistema como opción
      if (sistemas && sistemas.length > 0) {
        sistemas.forEach(sistema => {
          const option = document.createElement('option');
          option.value = sistema.id_sistema_pension;
          
          // Mostrar nombre y tipo para mejor identificación
          option.textContent = `${sistema.nombre} (${sistema.tipo})`;
          
          sistemaPensionSelect.appendChild(option);
        });
        
        console.log(`Se cargaron ${sistemas.length} sistemas de pensión`);
      } else {
        // Agregar opción indicando que no hay sistemas
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay sistemas disponibles';
        option.disabled = true;
        sistemaPensionSelect.appendChild(option);
        
        console.warn('No se encontraron sistemas de pensión');
      }
      
    } catch (error) {
      console.error('Error al cargar sistemas de pensión:', error);
      
      // Habilitar el select y mostrar opción de error
      sistemaPensionSelect.disabled = false;
      sistemaPensionSelect.innerHTML = `
        <option value="">Seleccionar...</option>
        <option value="" disabled>Error al cargar sistemas</option>
      `;
      
      // Mostrar toast de error
      this.mostrarError('No se pudieron cargar los sistemas de pensión');
    }
  }

  // Inicializar modal de detalle
  async initModalDetalle() {
    this.modalDetalle = document.getElementById('modalDetalleTrabajador');
    this.btnCerrarDetalle = document.getElementById('btnCerrarModalDetalle');

    // Event listeners para el modal de detalle
    if (this.btnCerrarDetalle) {
      this.btnCerrarDetalle.addEventListener('click', () => this.cerrarModalDetalle());
    }

    // Cerrar modal al hacer clic en el overlay
    if (this.modalDetalle) {
      this.modalDetalle.addEventListener('click', (e) => {
        if (e.target === this.modalDetalle) {
          this.cerrarModalDetalle();
        }
      });
    }

    // Inicializar pestañas del modal de detalle
    this.initTabsDetalle();

    // Cargar conceptos para la sección de asignación
    await this.cargarConceptosParaAsignacion();

    // Event listener para el botón de asignar concepto
    const btnAsignar = document.querySelector('.btn-asignar-concepto');
    if (btnAsignar) {
      btnAsignar.addEventListener('click', () => this.asignarConcepto());
    }
  }

  initTabsDetalle() {
    const tabButtons = document.querySelectorAll('[data-tab-detalle]');
    const tabContents = document.querySelectorAll('.tab-detalle-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab-detalle');
        
        // Remover clase active de todos los botones y contenidos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Agregar clase active al botón y contenido seleccionado
        button.classList.add('active');
        const selectedContent = document.getElementById(`tab-detalle-${tabId}`);
        if (selectedContent) {
          selectedContent.classList.add('active');
        }
      });
    });
  }

  async mostrarDetalleTrabajador(id) {
    try {
      console.log('Mostrando detalle del trabajador con ID:', id);
      
      // Obtener los datos del trabajador
      const trabajador = await window.electronAPI.obtenerTrabajadorPorId(id);
      console.log('Datos del trabajador para detalle:', trabajador);
      
      this.trabajadorIdDetalle = id;
      this.llenarDatosDetalle(trabajador);
      this.abrirModalDetalle();
      
    } catch (error) {
      console.error('Error al cargar detalle del trabajador:', error);
      this.mostrarError('Error al cargar los datos del trabajador');
    }
  }

  llenarDatosDetalle(trabajador) {
    // Resumen General
    this.setearTexto('detalle-documento-completo', `${trabajador.tipo_dni || 'N/A'} - ${trabajador.numero_documento || 'N/A'}`);
    this.setearTexto('detalle-sexo', trabajador.sexo || 'N/A');
    this.setearTexto('detalle-telefono', trabajador.telefono || 'N/A');
    this.setearTexto('detalle-fecha-ingreso', this.formatearFecha(trabajador.fecha_ingreso));
    this.setearTexto('detalle-sistema-pension', trabajador.sistema_pension_nombre || 'N/A');
    this.setearTexto('detalle-fecha-nacimiento', this.formatearFecha(trabajador.fecha_nacimiento));
    this.setearTexto('detalle-estado-civil', trabajador.estado_civil || 'N/A');
    this.setearTexto('detalle-email', trabajador.correo || 'N/A');
    this.setearTexto('detalle-sueldo-basico', `S/ ${Number(trabajador.sueldo || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    this.setearTexto('detalle-nacionalidad', trabajador.nacionalidad || 'N/A');
    this.setearTexto('detalle-direccion', trabajador.direccion || 'N/A');
    this.setearTexto('detalle-tipo-trabajador', trabajador.tipo_trabajador || 'N/A');
    this.setearTexto('detalle-banco', trabajador.banco || 'N/A');

    // Personal - Datos Personales
    this.setearTexto('detalle-personal-documento', `${trabajador.tipo_dni || 'N/A'} - ${trabajador.numero_documento || 'N/A'}`);
    this.setearTexto('detalle-personal-fecha-nacimiento', this.formatearFecha(trabajador.fecha_nacimiento));
    this.setearTexto('detalle-personal-estado-civil', trabajador.estado_civil || 'N/A');
    this.setearTexto('detalle-personal-nacionalidad', trabajador.nacionalidad || 'N/A');
    this.setearTexto('detalle-personal-sexo', trabajador.sexo || 'N/A');

    // Personal - Contacto
    this.setearTexto('detalle-contacto-direccion', trabajador.direccion || 'N/A');
    this.setearTexto('detalle-contacto-departamento', trabajador.departamento || 'N/A');
    this.setearTexto('detalle-contacto-provincia', trabajador.provincia || 'N/A');
    this.setearTexto('detalle-contacto-distrito', trabajador.distrito || 'N/A');
    this.setearTexto('detalle-contacto-telefono', trabajador.telefono || 'N/A');
    this.setearTexto('detalle-contacto-email', trabajador.correo || 'N/A');

    // Laboral
    this.setearTexto('detalle-laboral-tipo-trabajador', trabajador.tipo_trabajador || 'N/A');
    this.setearTexto('detalle-laboral-fecha-ingreso', this.formatearFecha(trabajador.fecha_ingreso));
    this.setearTexto('detalle-laboral-sueldo-basico', `S/ ${Number(trabajador.sueldo || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    this.setearTexto('detalle-laboral-jornada', trabajador.tipo_jornada || 'N/A');
    this.setearTexto('detalle-laboral-area', trabajador.area || 'N/A');
    this.setearTexto('detalle-laboral-tipo-contrato', trabajador.tipo_contrato || 'N/A');
    this.setearTexto('detalle-laboral-regimen-laboral', trabajador.regimen_laboral || 'N/A');
    this.setearTexto('detalle-laboral-turno', trabajador.turnos || 'N/A');
  }

  setearTexto(elementId, texto) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
      elemento.textContent = texto;
    }
  }

  formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-PE');
    } catch (error) {
      return 'N/A';
    }
  }

  async abrirModalDetalle() {
    if (this.modalDetalle) {
      this.modalDetalle.style.display = 'flex';
      // Solo cambiar el overflow si no está ya manejado por otro modal
      if (document.body.style.overflow !== 'hidden') {
        document.body.style.overflow = 'hidden';
      }
      
      // Cargar conceptos disponibles y asignados
      await this.cargarConceptosParaAsignacion();
      await this.cargarConceptosAsignados();
    }
  }

  cerrarModalDetalle() {
    if (this.modalDetalle) {
      this.modalDetalle.style.display = 'none';
      // Solo restaurar el overflow si no hay otros modales activos
      const modalActivo = document.querySelector('.modal-overlay.active, .modal-detalle-overlay.active');
      if (!modalActivo) {
        document.body.style.overflow = '';
      }
      this.trabajadorIdDetalle = null;
    }
  }

  async cargarConceptosParaAsignacion() {
    try {
      console.log('Cargando conceptos para asignación...');
      
      // Obtener conceptos activos desde la API
      const conceptos = await window.electronAPI.obtenerConceptos({ activo: true });
      console.log('Conceptos cargados:', conceptos);
      
      const conceptoSelect = document.getElementById('concepto-select');
      if (conceptoSelect) {
        // Limpiar opciones existentes
        conceptoSelect.innerHTML = '<option value="">Seleccionar concepto...</option>';
        
        // Agrupar conceptos por tipo para mejor organización
        const conceptosPorTipo = {
          'ingreso': [],
          'descuento': [],
          'aporte-trabajador': [],
          'aporte-empleador': []
        };
        
        conceptos.forEach(concepto => {
          conceptosPorTipo[concepto.tipo].push(concepto);
        });
        
        // Agregar opciones agrupadas por tipo
        Object.keys(conceptosPorTipo).forEach(tipo => {
          if (conceptosPorTipo[tipo].length > 0) {
            // Crear grupo
            const optgroup = document.createElement('optgroup');
            optgroup.label = this.formatearTipoConcepto(tipo);
            
            conceptosPorTipo[tipo].forEach(concepto => {
              const option = document.createElement('option');
              option.value = concepto.id_concepto;
              option.textContent = `${concepto.codigo} - ${concepto.nombre} (${this.formatearValorConcepto(concepto)})`;
              option.dataset.tipo = concepto.tipo;
              option.dataset.tipoCalculo = concepto.tipo_calculo;
              option.dataset.valor = concepto.valor;
              optgroup.appendChild(option);
            });
            
            conceptoSelect.appendChild(optgroup);
          }
        });
        
        // Agregar evento change para manejar selección
        conceptoSelect.addEventListener('change', (e) => {
          this.manejarSeleccionConcepto(e);
        });
      }
      
    } catch (error) {
      console.error('Error al cargar conceptos:', error);
      
      const conceptoSelect = document.getElementById('concepto-select');
      if (conceptoSelect) {
        conceptoSelect.innerHTML = `
          <option value="">Error al cargar conceptos</option>
        `;
      }
      
      this.mostrarError('Error al cargar los conceptos disponibles');
    }
  }

  formatearTipoConcepto(tipo) {
    const tipos = {
      'ingreso': '💰 INGRESOS',
      'descuento': '⬇️ DESCUENTOS',
      'aporte-trabajador': '👤 APORTES DEL TRABAJADOR',
      'aporte-empleador': '🏢 APORTES DEL EMPLEADOR'
    };
    return tipos[tipo] || tipo.toUpperCase();
  }

  formatearValorConcepto(concepto) {
    if (concepto.tipo_calculo === 'monto-fijo') {
      return `S/ ${parseFloat(concepto.valor).toFixed(2)}`;
    } else {
      return `${parseFloat(concepto.valor).toFixed(2)}%`;
    }
  }

  manejarSeleccionConcepto(event) {
    // Solo para referencia futura si se necesita hacer algo cuando se selecciona un concepto
    const selectedOption = event.target.selectedOptions[0];
    
    if (!selectedOption || !selectedOption.value) {
      // Limpiar cualquier estado si no hay selección (por ejemplo, mostrar información adicional)
      console.log('Concepto deseleccionado');
    } else {
      console.log('Concepto seleccionado:', selectedOption.textContent);
    }
  }

  async asignarConcepto() {
    try {
      const conceptoSelect = document.getElementById('concepto-select');
      
      if (!conceptoSelect.value) {
        this.mostrarError('Debe seleccionar un concepto');
        return;
      }
      
      // Datos para la asignación (solo trabajador y concepto)
      const asignacionData = {
        id_trabajador: this.trabajadorIdDetalle,
        id_concepto: parseInt(conceptoSelect.value)
      };
      
      console.log('Asignando concepto:', asignacionData);
      
      // Cambiar texto del botón mientras se procesa
      const btnAsignar = document.querySelector('.btn-asignar-concepto');
      const textoOriginal = btnAsignar.textContent;
      btnAsignar.textContent = 'Asignando...';
      btnAsignar.disabled = true;
      
      try {
        // Llamar a la API para asignar el concepto
        const resultado = await window.electronAPI.asignarConceptoTrabajador(asignacionData);
        
        if (resultado.success) {
          // Limpiar campos
          conceptoSelect.value = '';
          
          // Recargar la lista de conceptos asignados
          await this.cargarConceptosAsignados();
          
          this.mostrarExito('Concepto asignado exitosamente');
        } else {
          throw new Error(resultado.message || 'Error al asignar el concepto');
        }
        
      } finally {
        // Restaurar botón
        btnAsignar.textContent = textoOriginal;
        btnAsignar.disabled = false;
      }
      
    } catch (error) {
      console.error('Error al asignar concepto:', error);
      
      // Manejar errores específicos
      if (error.message.includes('ya asignado') || error.message.includes('duplicate')) {
        this.mostrarError('Este concepto ya está asignado al trabajador');
      } else {
        this.mostrarError('Error al asignar el concepto: ' + error.message);
      }
    }
  }

  async cargarConceptosAsignados() {
    try {
      if (!this.trabajadorIdDetalle) return;
      
      console.log('Cargando conceptos asignados para trabajador:', this.trabajadorIdDetalle);
      
      // Llamar a la API para obtener los conceptos asignados
      const conceptosAsignados = await window.electronAPI.obtenerConceptosAsignadosTrabajador(this.trabajadorIdDetalle);
      
      console.log('Conceptos asignados obtenidos:', conceptosAsignados);
      this.renderizarConceptosAsignados(conceptosAsignados);
      
    } catch (error) {
      console.error('Error al cargar conceptos asignados:', error);
      
      // Mostrar mensaje de error en el contenedor
      const container = document.getElementById('conceptos-asignados-container');
      if (container) {
        container.innerHTML = `
          <div class="conceptos-error">
            <div class="icono-error">⚠️</div>
            <h3>Error al cargar conceptos</h3>
            <p>No se pudieron cargar los conceptos asignados al trabajador</p>
          </div>
        `;
      }
      
      this.mostrarError('Error al cargar los conceptos asignados: ' + error.message);
    }
  }

  renderizarConceptosAsignados(conceptos) {
    const container = document.getElementById('conceptos-asignados-container');
    if (!container) return;
    
    if (conceptos.length === 0) {
      container.innerHTML = `
        <div class="conceptos-vacio">
          <div class="icono-vacio">📝</div>
          <h3>No hay conceptos asignados</h3>
          <p>Utiliza el formulario de arriba para asignar conceptos a este trabajador</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = conceptos.map(concepto => {
      const fechaAsignacion = concepto.fecha_asignacion ? 
        new Date(concepto.fecha_asignacion).toLocaleDateString('es-PE', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }) : 'Sin fecha';
        
      return `
        <div class="concepto-panel" data-concepto-id="${concepto.id_concepto}">
          <div class="concepto-contenido">
            <div class="concepto-principal">
              <div class="concepto-titulo">${concepto.nombre}</div>
              <div class="concepto-tipo">${this.formatearTipoConceptoSimple(concepto.tipo)}</div>
            </div>
            <div class="concepto-fecha">Desde: ${fechaAsignacion}</div>
          </div>
          <div class="concepto-acciones">
            <button class="btn-desvincular-moderno" data-concepto-id="${concepto.id_concepto}" title="Desvincular concepto">
              <span class="icono-interrogacion">❓</span>
              Desvincular
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Agregar event listeners para los botones de desvincular
    const botonesDesvincular = container.querySelectorAll('.btn-desvincular-moderno');
    botonesDesvincular.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const conceptoId = e.target.dataset.conceptoId;
        this.desvincularConcepto(conceptoId);
      });
    });
  }

  formatearTipoConceptoSimple(tipo) {
    const tipos = {
      'ingreso': 'Ingreso',
      'descuento': 'Descuento',
      'aporte-trabajador': 'Aporte Trabajador',
      'aporte-empleador': 'Aporte Empleador'
    };
    return tipos[tipo] || tipo;
  }

  async desvincularConcepto(conceptoId) {
    if (!confirm('¿Está seguro de que desea desvincular este concepto del trabajador?')) {
      return;
    }
    
    try {
      console.log('Desvinculando concepto:', conceptoId, 'del trabajador:', this.trabajadorIdDetalle);
      
      // Llamar a la API para desvincular el concepto
      const resultado = await window.electronAPI.desvincularConceptoTrabajador(
        this.trabajadorIdDetalle, 
        conceptoId
      );
      
      if (resultado.success) {
        // Recargar la lista de conceptos asignados
        await this.cargarConceptosAsignados();
        
        this.mostrarExito('Concepto desvinculado exitosamente');
      } else {
        throw new Error(resultado.message || 'Error al desvincular el concepto');
      }
      
    } catch (error) {
      console.error('Error al desvincular concepto:', error);
      this.mostrarError('Error al desvincular el concepto: ' + error.message);
    }
  }

  mostrarExito(mensaje) {
    // Por ahora usamos alert, pero podrías implementar un toast
    alert('✅ ' + mensaje);
  }
}

// Hacer la clase disponible globalmente
window.TrabajadoresManager = TrabajadoresManager;

// Inicializar cuando se carga la vista de trabajadores
if (document.querySelector('.trabajadores-gestion')) {
  new TrabajadoresManager();
}
