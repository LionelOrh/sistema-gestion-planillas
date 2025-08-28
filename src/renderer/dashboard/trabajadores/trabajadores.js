// Lógica simple para mostrar trabajadores
class TrabajadoresManager {
  constructor() {
    this.formSubmitListener = (e) => this.guardarTrabajador(e);
    this.modoEdicion = false;
    this.trabajadorEnEdicion = null;
    this.trabajadorIdDetalle = null;
    this.form = document.getElementById('formTrabajador');
    if (this.form) {
      this.form.removeEventListener('submit', this.formSubmitListener);
      this.form.addEventListener('submit', this.formSubmitListener);
    }
    this.init();
    setTimeout(() => {
      this.initModal();
      this.initModalDetalle();
    }, 100);
  }

  async init() {
    await this.cargarTrabajadores();

    
    // Inicializar botón de asistencia
    const btnVerAsistencia = document.getElementById('btnVerAsistencia');
    if (btnVerAsistencia) {
      btnVerAsistencia.addEventListener('click', () => {
        const modal = document.getElementById('modalAsistenciaTrabajadores');
        if (modal) {
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      });
    }
    // Cerrar modal asistencia
    const btnCerrar1 = document.getElementById('btnCerrarModalAsistencia');
    const btnCerrar2 = document.getElementById('btnCerrarModalAsistenciaFooter');
    const modalAsistencia = document.getElementById('modalAsistenciaTrabajadores');
    [btnCerrar1, btnCerrar2].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (modalAsistencia) {
            modalAsistencia.style.display = 'none';
            document.body.style.overflow = '';
          }
        });
      }
    });
    if (modalAsistencia) {
      modalAsistencia.addEventListener('click', (e) => {
        if (e.target === modalAsistencia) {
          modalAsistencia.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }
  }

  async initModal() {
    // Referencias del modal
    this.modal = document.getElementById('modalAgregarTrabajador');
    this.btnAgregar = document.getElementById('btnAgregarTrabajador');
    this.btnCerrar = document.getElementById('btnCerrarModal');
    this.btnCancelar = document.getElementById('btnCancelar');


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

    // **Manejar lógica de Asignación Familiar**
    this.initAsignacionFamiliar();

    // **Manejar lógica de Fecha de Cese según Tipo de Contrato**
    this.initTipoContratoYFechaCese();

  }

  initAsignacionFamiliar() {
    const checkboxAsignacion = document.getElementById('asignacionFamiliar');
    const inputCantidadHijos = document.getElementById('cantidadHijos');

    if (checkboxAsignacion && inputCantidadHijos) {
      // Función para controlar el estado del campo cantidad de hijos
      const actualizarEstadoCampoHijos = () => {
        console.log('Actualizando estado campo hijos. Checkbox marcado:', checkboxAsignacion.checked);
        if (checkboxAsignacion.checked) {
          inputCantidadHijos.disabled = false;
          inputCantidadHijos.style.opacity = '1';
          if (inputCantidadHijos.value === '0' || inputCantidadHijos.value === '') {
            inputCantidadHijos.value = '1'; // Valor por defecto cuando se habilita
          }
        } else {
          inputCantidadHijos.disabled = true;
          inputCantidadHijos.style.opacity = '0.5';
          inputCantidadHijos.value = '0'; // Resetear a 0 cuando se deshabilita
        }
      };

      // Event listener para el checkbox
      checkboxAsignacion.addEventListener('change', actualizarEstadoCampoHijos);

      // Estado inicial
      actualizarEstadoCampoHijos();

      console.log('Asignación familiar inicializada correctamente');
    } else {
      console.error('No se pudieron encontrar los elementos de asignación familiar');
    }
  }

  initTipoContratoYFechaCese() {
    const selectTipoContrato = document.getElementById('tipoContrato');
    const inputFechaCese = document.getElementById('fechaCese');
    const inputFechaIngreso = document.getElementById('fechaIngreso');

    if (selectTipoContrato && inputFechaCese && inputFechaIngreso) {
      // Función para controlar el estado del campo fecha de cese
      const actualizarEstadoFechaCese = () => {
        const tipoContrato = selectTipoContrato.value;
        console.log('Actualizando estado fecha de cese. Tipo de contrato:', tipoContrato);

        if (tipoContrato === 'PLAZO_FIJO') {
          inputFechaCese.disabled = false;
          inputFechaCese.style.opacity = '1';
          inputFechaCese.required = true;
        } else {
          inputFechaCese.disabled = true;
          inputFechaCese.style.opacity = '0.5';
          inputFechaCese.required = false;
          inputFechaCese.value = ''; // Limpiar el valor cuando se deshabilita
        }
      };

      // Validación de fechas
      const validarFechas = () => {
        const fechaIngreso = new Date(inputFechaIngreso.value);
        const fechaCese = new Date(inputFechaCese.value);

        if (inputFechaIngreso.value && inputFechaCese.value && !inputFechaCese.disabled) {
          if (fechaCese <= fechaIngreso) {
            inputFechaCese.setCustomValidity('La fecha de cese debe ser posterior a la fecha de ingreso');
          } else {
            inputFechaCese.setCustomValidity('');
          }
        } else {
          inputFechaCese.setCustomValidity('');
        }
      };

      // Event listeners
      selectTipoContrato.addEventListener('change', () => {
        actualizarEstadoFechaCese();
        validarFechas();
      });

      inputFechaIngreso.addEventListener('change', validarFechas);
      inputFechaCese.addEventListener('change', validarFechas);

      // Estado inicial
      actualizarEstadoFechaCese();

      console.log('Lógica de tipo de contrato y fecha de cese inicializada correctamente');
    } else {
      console.error('No se pudieron encontrar los elementos de tipo de contrato y fecha de cese');
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
      this.setFieldValue('fechaCese', trabajador.fecha_cese);
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

      // Asignación Familiar - Manejo especial para checkbox
      const checkboxAsignacion = document.getElementById('asignacionFamiliar');
      if (checkboxAsignacion) {
        checkboxAsignacion.checked = trabajador.asignacion_familiar === 1;
        // Disparar el evento change para actualizar el estado del campo hijos
        setTimeout(() => {
          checkboxAsignacion.dispatchEvent(new Event('change'));
        }, 100);
      }

      this.setFieldValue('cantidadHijos', trabajador.cantidad_hijos || 0);

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
    console.log('guardarTrabajador ejecutado', this.modoEdicion, this.trabajadorEnEdicion);

    // Validar campos requeridos antes de enviar
    if (!this.validarCamposRequeridos()) {
      this.mostrarError('Por favor, complete todos los campos requeridos');
      return;
    }

    // Obtener datos del formulario
    const formData = new FormData(this.form);
    const trabajadorData = Object.fromEntries(formData);

    // Asignación familiar
    const checkboxAsignacion = document.getElementById('asignacionFamiliar');
    const inputCantidadHijos = document.getElementById('cantidadHijos');
    if (checkboxAsignacion) {
      trabajadorData.asignacionFamiliar = checkboxAsignacion.checked ? 'on' : '';
    }
    if (inputCantidadHijos) {
      trabajadorData.cantidadHijos = inputCantidadHijos.value || '0';
    }

    const btnGuardar = document.querySelector('.btn-guardar');
    const textoOriginal = btnGuardar ? btnGuardar.textContent : '';

    try {
      if (btnGuardar) {
        btnGuardar.textContent = this.modoEdicion ? 'Actualizando...' : 'Guardando...';
        btnGuardar.disabled = true;
      }

      let resultado;

      // SOLO actualizar si es edición, SOLO crear si es nuevo
      if (this.modoEdicion && this.trabajadorEnEdicion && this.trabajadorEnEdicion.id_trabajador) {
        resultado = await window.electronAPI.actualizarTrabajador(
          this.trabajadorEnEdicion.id_trabajador,
          trabajadorData
        );
      } else {
        resultado = await window.electronAPI.crearTrabajador(trabajadorData);
      }

      if (!resultado.error && !resultado.message) {
        this.mostrarExito(this.modoEdicion ? 'Trabajador actualizado exitosamente' : 'Trabajador agregado exitosamente');
        this.cerrarModal();
        await this.cargarTrabajadores();
      } else {
        const mensajeError = resultado.message || resultado.error || '';
        if (!mensajeError.includes('El número de documento ya existe')) {
          this.mostrarError(mensajeError || 'Ocurrió un error');
        }
      }

    } catch (error) {
      console.error('Error al guardar trabajador:', error);
      const operacion = this.modoEdicion ? 'actualizar' : 'guardar';
      this.mostrarError(`Error al ${operacion} el trabajador: ` + error.message);
    } finally {
      if (btnGuardar && textoOriginal) {
        btnGuardar.textContent = textoOriginal;
        btnGuardar.disabled = false;
      } else if (btnGuardar) {
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
      z-index: 10001;
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
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
          <div class="acciones-container">
            <div class="dropdown-menu-container">
              <button class="btn-menu-opciones" data-id="${trabajador.id_trabajador}" title="Opciones">
                <span class="dots">⋮</span>
              </button>
              <div class="dropdown-menu" data-id="${trabajador.id_trabajador}">
                <button class="dropdown-item" data-accion="detalle" data-id="${trabajador.id_trabajador}">
                  👁️ Ver Detalle
                </button>
                <button class="dropdown-item" data-accion="editar" data-id="${trabajador.id_trabajador}">
                  ✏️ Editar Trabajador
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" data-accion="constancia" data-id="${trabajador.id_trabajador}">
                  📄 Generar Constancia
                </button>
                <button class="dropdown-item" data-accion="asistencia" data-id="${trabajador.id_trabajador}">
                  🕒 Registrar Asistencia
                </button>
              </div>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(fila);
    });

    // Agregar event listeners a los botones de acción
    this.initActionButtons();

  }

  initActionButtons() {
    const botonesMenu = document.querySelectorAll('.btn-menu-opciones');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    // Event listeners para el menú de opciones
    botonesMenu.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const dropdown = document.querySelector(`.dropdown-menu[data-id="${id}"]`);

        // Cerrar todos los otros dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          if (menu !== dropdown) {
            menu.classList.remove('show');
          }
        });

        // Toggle del dropdown actual
        dropdown.classList.toggle('show');
      });
    });

    // Event listeners para las opciones del menú
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const accion = e.currentTarget.getAttribute('data-accion');
        const id = e.currentTarget.getAttribute('data-id');

        // Cerrar dropdown
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });

        // Ejecutar acción
        this.ejecutarAccionTrabajador(accion, id);
      });
    });

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
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

  async ejecutarAccionTrabajador(accion, id) {
    try {
      console.log(`Ejecutando acción: ${accion} para trabajador ID: ${id}`);

      switch (accion) {
        case 'detalle':
          await this.mostrarDetalleTrabajador(id);
          break;

        case 'editar':
          await this.editarTrabajador(id);
          break;

        case 'constancia':
          await this.generarConstanciaTrabajo(id);
          break;

        case 'asistencia':
          await this.abrirModalAsistencia(id);
          break;

        default:
          console.log(`Acción no reconocida: ${accion}`);
          this.mostrarInfo(`Función "${accion}" en desarrollo`);
      }

    } catch (error) {
      console.error('Error ejecutando acción:', error);
      this.mostrarError('Error al ejecutar la acción: ' + error.message);
    }
  }

  async generarConstanciaTrabajo(id) {
    try {
      console.log('Generando constancia de trabajo para trabajador:', id);

      // Obtener datos del trabajador
      const trabajador = await window.electronAPI.obtenerTrabajadorPorId(id);

      // Abrir modal de constancia
      this.abrirModalConstancia(trabajador);

    } catch (error) {
      console.error('Error generando constancia:', error);
      this.mostrarError('Error al generar la constancia: ' + error.message);
    }
  }

  async abrirModalConstancia(trabajador) {
    try {
      console.log('Abriendo modal de constancia para:', trabajador);

      // Crear el modal si no existe
      let modalConstancia = document.getElementById('modalConstanciaTrabajo');
      if (!modalConstancia) {
        modalConstancia = this.crearModalConstancia();
        document.body.appendChild(modalConstancia);
      }

      // Rellenar datos del trabajador en la constancia
      this.llenarDatosConstancia(trabajador);

      // Mostrar el modal
      modalConstancia.style.display = 'flex';
      document.body.style.overflow = 'hidden';

    } catch (error) {
      console.error('Error abriendo modal de constancia:', error);
      this.mostrarError('Error al abrir el modal de constancia');
    }
  }

  crearModalConstancia() {
    const modal = document.createElement('div');
    modal.id = 'modalConstanciaTrabajo';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal-constancia-container">
        <div class="modal-header">
          <h2>📄 Constancia de Trabajo</h2>
          <button class="modal-close" id="btnCerrarModalConstancia">&times;</button>
        </div>
        
        <div class="modal-constancia-content">
          <!-- Vista previa de la constancia -->
          <div class="constancia-preview">
            <div class="constancia-documento" id="constanciaDocumento">
              <div class="constancia-header">
                <div class="empresa-info">
                  <h1>TIC-TECHNOLOGIES</h1>
                  <p class="empresa-subtitulo">R.U.C. 20XXXXXXXXX</p>
                </div>
              </div>
              

              <div class="constancia-body">
                <h2 class="constancia-titulo">CONSTANCIA DE TRABAJO</h2>
                
                <div class="constancia-contenido">
                  <p>Por medio de la presente, se deja constancia que <strong id="nombreCompleto">[NOMBRE COMPLETO]</strong>, identificado(a) con D.N.I. N° <strong id="dniTrabajador">[DNI]</strong>, labora en nuestra empresa <strong>TIC-TECHNOLOGIES</strong> desde el <strong id="fechaIngresoConstancia">[FECHA INGRESO]</strong>, desempeñando el cargo de <strong id="cargoTrabajador">[CARGO]</strong>.</p>
                  
                  <p>Durante su permanencia en la empresa, ha demostrado ser una persona responsable, eficiente y con gran disposición para las tareas encomendadas.</p>
                  
                  <p>Se expide la presente constancia a solicitud del interesado(a) para los fines que estime convenientes.</p>
                  
                  <div class="constancia-fecha-lugar">
                    <p>Lima, <span id="fechaActual">[FECHA ACTUAL]</span></p>
                  </div>
                  
                  <div class="constancia-firma">
                    <div class="firma-linea">_________________________</div>
                    <div class="firma-texto">
                      <p><strong>Firma del Representante Legal</strong></p>
                      <p>TIC-TECHNOLOGIES</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones del Modal -->
        <div class="modal-footer">
          <button type="button" class="btn-cancelar" id="btnCancelarConstancia">Cancelar</button>
          <button type="button" class="btn-descargar-pdf" id="btnDescargarConstancia">📁 Descargar PDF</button>
        </div>
      </div>
    `;

    // Agregar event listeners
    setTimeout(() => {
      const btnCerrar = modal.querySelector('#btnCerrarModalConstancia');
      const btnCancelar = modal.querySelector('#btnCancelarConstancia');
      const btnDescargar = modal.querySelector('#btnDescargarConstancia');

      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => this.cerrarModalConstancia());
      }

      if (btnCancelar) {
        btnCancelar.addEventListener('click', () => this.cerrarModalConstancia());
      }

      if (btnDescargar) {
        btnDescargar.addEventListener('click', () => this.descargarConstanciaPDF());
      }

      // Cerrar modal al hacer clic en el overlay
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.cerrarModalConstancia();
        }
      });
    }, 100);

    return modal;
  }

  llenarDatosConstancia(trabajador) {
    try {
      console.log('Llenando datos de constancia con trabajador:', trabajador);

      // Rellenar nombre completo
      const nombreCompleto = document.getElementById('nombreCompleto');
      if (nombreCompleto) {
        nombreCompleto.textContent = `${trabajador.nombres} ${trabajador.apellidos}`;
      }

      // Rellenar DNI
      const dniTrabajador = document.getElementById('dniTrabajador');
      if (dniTrabajador) {
        dniTrabajador.textContent = trabajador.numero_documento;
      }

      // Rellenar fecha de ingreso con debugging
      const fechaIngresoConstancia = document.getElementById('fechaIngresoConstancia');
      if (fechaIngresoConstancia) {
        console.log('Fecha ingreso raw:', trabajador.fecha_ingreso);
        console.log('Tipo de fecha ingreso:', typeof trabajador.fecha_ingreso);

        const fecha = new Date(trabajador.fecha_ingreso);
        console.log('Fecha objeto:', fecha);

        const fechaFormateada = fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        console.log('Fecha formateada:', fechaFormateada);

        fechaIngresoConstancia.textContent = fechaFormateada;
      } else {
        console.error('No se encontró el elemento fechaIngresoConstancia');
      }

      // Rellenar cargo
      const cargoTrabajador = document.getElementById('cargoTrabajador');
      if (cargoTrabajador) {
        cargoTrabajador.textContent = trabajador.cargo;
      }

      // Rellenar fecha actual
      const fechaActual = document.getElementById('fechaActual');
      if (fechaActual) {
        const hoy = new Date();
        const fechaFormateada = hoy.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        fechaActual.textContent = fechaFormateada;
      }

      // Guardar datos del trabajador para la descarga del PDF
      this.trabajadorConstancia = trabajador;

    } catch (error) {
      console.error('Error llenando datos de constancia:', error);
      this.mostrarError('Error al llenar los datos de la constancia');
    }
  }

  cerrarModalConstancia() {
    const modal = document.getElementById('modalConstanciaTrabajo');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      this.trabajadorConstancia = null;
    }
  }

  async descargarConstanciaPDF() {
    try {
      if (!this.trabajadorConstancia) {
        this.mostrarError('No hay datos de trabajador para generar el PDF');
        return;
      }

      console.log('Descargando constancia PDF para:', this.trabajadorConstancia);

      // Cambiar texto del botón
      const btnDescargar = document.getElementById('btnDescargarConstancia');
      const textoOriginal = btnDescargar.textContent;
      btnDescargar.textContent = '⏳ Generando PDF...';
      btnDescargar.disabled = true;

      try {
        // Preparar datos para el PDF
        const datosConstancia = {
          nombreCompleto: `${this.trabajadorConstancia.nombres} ${this.trabajadorConstancia.apellidos}`,
          dni: this.trabajadorConstancia.numero_documento,
          fechaIngreso: new Date(this.trabajadorConstancia.fecha_ingreso).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          cargo: this.trabajadorConstancia.cargo,
          fechaActual: new Date().toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        };

        // Llamar al servicio para generar el PDF
        const resultado = await window.electronAPI.generarConstanciaPDF(datosConstancia);

        if (resultado.success) {
          this.mostrarExito(resultado.mensaje || 'Constancia generada exitosamente');
          // Opcionalmente cerrar el modal después de generar
          // this.cerrarModalConstancia();
        } else {
          throw new Error(resultado.error || 'Error al generar el PDF');
        }

      } finally {
        // Restaurar botón
        btnDescargar.textContent = textoOriginal;
        btnDescargar.disabled = false;
      }

    } catch (error) {
      console.error('Error descargando constancia PDF:', error);
      this.mostrarError('Error al descargar la constancia: ' + error.message);
    }
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
    this.setearTexto('detalle-asignacion-familiar', trabajador.asignacion_familiar === 1 ? 'Sí' : 'No');
    this.setearTexto('detalle-cantidad-hijos', trabajador.cantidad_hijos || '0');

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
    this.setearTexto('detalle-laboral-fecha-cese', trabajador.fecha_cese ? this.formatearFecha(trabajador.fecha_cese) : 'N/A');
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

      // Filtrar para excluir "Asignación Familiar" (por código o nombre)
      const conceptosFiltrados = conceptos.filter(concepto =>
        concepto.codigo !== "022" &&
        concepto.nombre.toLowerCase() !== "asignación familiar"
      );

      // Agrupar conceptos por tipo para mejor organización
      const conceptoSelect = document.getElementById('concepto-select');
      if (conceptoSelect) {
        conceptoSelect.innerHTML = '<option value="">Seleccionar concepto...</option>';
        const conceptosPorTipo = {
          'ingreso': [],
          'descuento': [],
          'aporte-trabajador': [],
          'aporte-empleador': []
        };
        conceptosFiltrados.forEach(concepto => {
          conceptosPorTipo[concepto.tipo].push(concepto);
        });
        Object.keys(conceptosPorTipo).forEach(tipo => {
          if (conceptosPorTipo[tipo].length > 0) {
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

      // Filtrar para excluir "Asignación Familiar" (por código o nombre)
      const conceptosFiltrados = conceptosAsignados.filter(concepto =>
        concepto.codigo !== "022" &&
        concepto.nombre.toLowerCase() !== "asignación familiar"
      );

      console.log('Conceptos asignados obtenidos:', conceptosFiltrados);
      this.renderizarConceptosAsignados(conceptosFiltrados);
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

  async abrirModalAsistencia(idTrabajador) {
    const trabajador = await window.electronAPI.obtenerTrabajadorPorId(idTrabajador);
    let modalAsistencia = document.getElementById('modalRegistrarAsistencia');
    const horaActual = new Date();
    const horaStr = horaActual.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (!modalAsistencia) {
      modalAsistencia = document.createElement('div');
      modalAsistencia.id = 'modalRegistrarAsistencia';
      modalAsistencia.className = 'modal-overlay active';
      modalAsistencia.innerHTML = `
        <div class="modal-asistencia-box">
          <div class="modal-header">
            <h2>Registrar Asistencia</h2>
            <button class="modal-close" id="btnCerrarModalAsistencia">&times;</button>
          </div>
          <form id="formAsistencia" class="modal-form">
            <div class="form-group">
              <label>Trabajador</label>
              <input type="text" value="${trabajador.nombres} ${trabajador.apellidos}" disabled>
            </div>
            <div class="form-group">
              <label for="horaRegistro">Hora de Registro</label>
              <input type="time" id="horaRegistro" name="horaRegistro" value="${horaStr}" readonly>
            </div>
            <div class="form-group">
              <label>Tipo de Registro</label>
              <div class="asistencia-btn-group">
                <button type="button" class="btn-entrada" id="btnEntrada">Entrada</button>
                <button type="button" class="btn-salida" id="btnSalida">Salida</button>
              </div>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modalAsistencia);
    } else {
      // Si ya existe, actualiza la hora y trabajador
      modalAsistencia.querySelector('input[type="text"]').value = `${trabajador.nombres} ${trabajador.apellidos}`;
      const horaInput = modalAsistencia.querySelector('#horaRegistro');
      if (horaInput) horaInput.value = horaStr;
      modalAsistencia.style.display = 'flex';
      modalAsistencia.classList.add('active');
    }

    modalAsistencia.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const btnCerrar = document.getElementById('btnCerrarModalAsistencia');
      if (btnCerrar) {
        btnCerrar.onclick = () => {
          modalAsistencia.style.display = 'none';
          modalAsistencia.classList.remove('active');
          document.body.style.overflow = '';
        };
      }
      modalAsistencia.onclick = (e) => {
        if (e.target === modalAsistencia) {
          modalAsistencia.style.display = 'none';
          modalAsistencia.classList.remove('active');
          document.body.style.overflow = '';
        }
      };
      const btnEntrada = document.getElementById('btnEntrada');
      const btnSalida = document.getElementById('btnSalida');
      const horaInput = document.getElementById('horaRegistro');
      btnEntrada.onclick = async () => {
        await this.registrarAsistencia(trabajador.id_trabajador, horaInput.value, 'entrada');
        modalAsistencia.style.display = 'none';
        modalAsistencia.classList.remove('active');
        document.body.style.overflow = '';
      };
      btnSalida.onclick = async () => {
        await this.registrarAsistencia(trabajador.id_trabajador, horaInput.value, 'salida');
        modalAsistencia.style.display = 'none';
        modalAsistencia.classList.remove('active');
        document.body.style.overflow = '';
      };
    }, 100);
  }

  async registrarAsistencia(idTrabajador, hora, tipo) {
    // Aquí puedes implementar la lógica de guardar la asistencia (por ahora solo muestra un toast)
    this.mostrarExito(`Asistencia registrada: ${tipo === 'entrada' ? 'Entrada' : 'Salida'} a las ${hora}`);
    // Ejemplo: await window.electronAPI.registrarAsistencia({ idTrabajador, hora, tipo });
  }
}

// Hacer la clase disponible globalmente
window.TrabajadoresManager = TrabajadoresManager;

// Inicializar cuando se carga la vista de trabajadores
if (document.querySelector('.trabajadores-gestion')) {
  new TrabajadoresManager();
}
