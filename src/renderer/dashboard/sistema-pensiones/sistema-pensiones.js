// Gestor de Sistema de Pensiones
class SistemaPensionesManager {
  constructor() {
    this.modoEdicion = false;
    this.sistemaEnEdicion = null;
    this.init();
  }

  init() {
    this.initEventListeners();
    this.cargarSistemas();
  }

  initEventListeners() {
    // Referencias del modal
    this.modal = document.getElementById('modalNuevoSistema');
    this.btnNuevo = document.getElementById('btnNuevoSistema');
    this.btnCerrar = document.getElementById('btnCerrarModal');
    this.btnCancelar = document.getElementById('btnCancelar');
    this.form = document.getElementById('formNuevoSistema');
    this.tipoSelect = document.getElementById('tipoSistema');
    this.detallesAfp = document.getElementById('detallesAfp');
    this.detallesOnp = document.getElementById('detallesOnp');

    // Event listeners
    if (this.btnNuevo) {
      this.btnNuevo.addEventListener('click', () => this.abrirModal());
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

    // Manejar cambio de tipo de sistema
    if (this.tipoSelect) {
      this.tipoSelect.addEventListener('change', (e) => {
        this.cambiarTipoSistema(e.target.value);
      });
    }

    // Manejar envío del formulario
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.guardarSistema(e));
    }

    // Escape key para cerrar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.cerrarModal();
      }
    });
  }

  cambiarTipoSistema(tipo) {
    // Ocultar todas las secciones primero
    if (this.detallesAfp) {
      this.detallesAfp.style.display = 'none';
    }
    if (this.detallesOnp) {
      this.detallesOnp.style.display = 'none';
    }

    // Mostrar la sección correspondiente
    if (tipo === 'AFP' && this.detallesAfp) {
      this.detallesAfp.style.display = 'block';
      this.limpiarCamposOnp();
    } else if (tipo === 'ONP' && this.detallesOnp) {
      this.detallesOnp.style.display = 'block';
      this.limpiarCamposAfp();
    }
  }

  limpiarCamposAfp() {
    // Limpiar campos de AFP cuando se cambia a ONP
    const camposAfp = ['fondoAfp', 'comisionAfp', 'seguroAfp', 'tipoComision'];
    camposAfp.forEach(campo => {
      const input = document.getElementById(campo);
      if (input) {
        input.value = '';
      }
    });
  }

  limpiarCamposOnp() {
    // Limpiar campos de ONP cuando se cambia a AFP
    const input = document.getElementById('porcentajeOnp');
    if (input) {
      input.value = '';
    }
  }

  abrirModal(sistemaData = null) {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      const modalContent = this.modal.querySelector('.modal-content');
      
      // Configurar modo edición o creación
      if (sistemaData) {
        this.modoEdicion = true;
        this.sistemaEnEdicion = sistemaData;
        this.cargarDatosEnModal(sistemaData);
        
        // Agregar clase visual para modo edición
        if (modalContent) {
          modalContent.classList.add('editing');
        }
        
        // Cambiar título del modal
        const modalTitle = this.modal.querySelector('.modal-header h3');
        if (modalTitle) {
          modalTitle.textContent = 'Editar Sistema de Pensión';
        }
        
        // Cambiar texto del botón
        const btnGuardar = this.modal.querySelector('.btn-guardar');
        if (btnGuardar) {
          btnGuardar.textContent = 'Actualizar Sistema';
        }
      } else {
        this.modoEdicion = false;
        this.sistemaEnEdicion = null;
        
        // Remover clase visual para modo edición
        if (modalContent) {
          modalContent.classList.remove('editing');
        }
        
        // Restaurar título del modal
        const modalTitle = this.modal.querySelector('.modal-header h3');
        if (modalTitle) {
          modalTitle.textContent = 'Nuevo Sistema de Pensión';
        }
        
        // Restaurar texto del botón
        const btnGuardar = this.modal.querySelector('.btn-guardar');
        if (btnGuardar) {
          btnGuardar.textContent = 'Guardar Sistema';
        }
      }
      
      // Enfocar el primer input
      const firstInput = this.modal.querySelector('input, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  cargarDatosEnModal(sistema) {
    try {
      // Cargar datos básicos
      const nombreInput = document.getElementById('nombreSistema');
      const tipoSelect = document.getElementById('tipoSistema');
      const codigoSapInput = document.getElementById('codigoSap');
      
      if (nombreInput) nombreInput.value = sistema.nombre || '';
      if (tipoSelect) tipoSelect.value = sistema.tipo || '';
      if (codigoSapInput) codigoSapInput.value = sistema.codigo_sap || '';
      
      // Mostrar la sección correspondiente según el tipo
      this.cambiarTipoSistema(sistema.tipo);
      
      // Cargar datos específicos según el tipo
      if (sistema.tipo === 'AFP') {
        const fondoInput = document.getElementById('fondoAfp');
        const comisionInput = document.getElementById('comisionAfp');
        const seguroInput = document.getElementById('seguroAfp');
        const tipoComisionSelect = document.getElementById('tipoComision');
        
        if (fondoInput) fondoInput.value = sistema.fondo || '';
        if (comisionInput) comisionInput.value = sistema.comision || '';
        if (seguroInput) seguroInput.value = sistema.seguro || '';
        if (tipoComisionSelect) tipoComisionSelect.value = sistema.tipo_comision || 'FLUJO';
        
      } else if (sistema.tipo === 'ONP') {
        const porcentajeInput = document.getElementById('porcentajeOnp');
        if (porcentajeInput) porcentajeInput.value = sistema.porcentaje || '';
      }
      
    } catch (error) {
      console.error('Error al cargar datos en el modal:', error);
      this.mostrarError('Error al cargar los datos del sistema');
    }
  }

  cerrarModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      
      const modalContent = this.modal.querySelector('.modal-content');
      
      // Remover clase visual de edición
      if (modalContent) {
        modalContent.classList.remove('editing');
      }
      
      // Restaurar título y botón por defecto
      const modalTitle = this.modal.querySelector('.modal-header h3');
      if (modalTitle) {
        modalTitle.textContent = 'Nuevo Sistema de Pensión';
      }
      
      const btnGuardar = this.modal.querySelector('.btn-guardar');
      if (btnGuardar) {
        btnGuardar.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Guardar Sistema
        `;
        btnGuardar.disabled = false;
      }
      
      // Usar el método de limpieza completa
      this.limpiarEstadoModal();
    }
  }

  async guardarSistema(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const sistemaData = Object.fromEntries(formData);
    
    // Validar datos según el tipo
    if (!this.validarDatos(sistemaData)) {
      return;
    }
    
    console.log('Datos del sistema a guardar:', sistemaData);
    
    // Referencias del botón
    const btnGuardar = this.form.querySelector('.btn-guardar');
    const textoOriginalBtn = this.modoEdicion ? 'Actualizar Sistema' : 'Guardar Sistema';
    
    try {
      // Mostrar loading en el botón
      if (btnGuardar) {
        btnGuardar.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          ${this.modoEdicion ? 'Actualizando...' : 'Guardando...'}
        `;
        btnGuardar.disabled = true;
      }
      
      let resultado;
      
      if (this.modoEdicion && this.sistemaEnEdicion) {
        // Actualizar sistema existente
        resultado = await window.electronAPI.actualizarSistemaPension(
          this.sistemaEnEdicion.id_sistema_pension, 
          sistemaData
        );
        this.mostrarExito('Sistema de pensión actualizado exitosamente');
      } else {
        // Crear nuevo sistema
        resultado = await window.electronAPI.crearSistemaPension(sistemaData);
        this.mostrarExito('Sistema de pensión agregado exitosamente');
      }
      
      console.log('Resultado de la operación:', resultado);
      
      // Cerrar modal
      this.cerrarModal();
      
      // Recargar tabla
      await this.cargarSistemas();
      
    } catch (error) {
      console.error('Error al guardar sistema:', error);
      const operacion = this.modoEdicion ? 'actualizar' : 'guardar';
      this.mostrarError(`Error al ${operacion} el sistema: ` + error.message);
    } finally {
      // Restaurar botón SIEMPRE, independientemente de éxito o error
      if (btnGuardar) {
        btnGuardar.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${textoOriginalBtn}
        `;
        btnGuardar.disabled = false;
      }
    }
  }

  validarDatos(data) {
    // Validaciones básicas
    if (!data.nombre || !data.nombre.trim()) {
      this.mostrarError('El nombre es requerido');
      document.getElementById('nombreSistema').focus();
      return false;
    }

    if (!data.tipo) {
      this.mostrarError('El tipo de sistema es requerido');
      document.getElementById('tipoSistema').focus();
      return false;
    }

    // Validaciones específicas por tipo
    if (data.tipo === 'AFP') {
      if (!data.fondo_afp || parseFloat(data.fondo_afp) < 0) {
        this.mostrarError('El fondo AFP debe ser un valor válido');
        document.getElementById('fondoAfp').focus();
        return false;
      }
      if (!data.comision_afp || parseFloat(data.comision_afp) < 0) {
        this.mostrarError('La comisión AFP debe ser un valor válido');
        document.getElementById('comisionAfp').focus();
        return false;
      }
    } else if (data.tipo === 'ONP') {
      if (!data.porcentaje_onp || parseFloat(data.porcentaje_onp) < 0) {
        this.mostrarError('El porcentaje ONP debe ser un valor válido');
        document.getElementById('porcentajeOnp').focus();
        return false;
      }
    }

    return true;
  }

  async cargarSistemas() {
    try {
      // Conectar con el servicio real cuando esté disponible
      const sistemas = await this.obtenerSistemas();
      this.renderizarTabla(sistemas);
    } catch (error) {
      console.error('Error al cargar sistemas:', error);
      this.mostrarError('Error al cargar los sistemas de pensión');
    }
  }

  async obtenerSistemas() {
    // Conectar con el servicio real para obtener los sistemas de pensión
    try {
      const sistemas = await window.electronAPI.obtenerSistemasPension();
      return sistemas;
    } catch (error) {
      console.error('Error al obtener sistemas:', error);
      throw error;
    }
  }

  renderizarTabla(sistemas) {
    const tbody = document.getElementById('sistemasTableBody');
    if (!tbody) {
      console.error('No se encontró el tbody de la tabla');
      return;
    }

    tbody.innerHTML = '';

    if (sistemas.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="4" class="empty-message">
            <div class="empty-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.486 2 2 6.486 2 12S6.486 22 12 22 22 17.514 22 12 17.514 2 12 2ZM12 13H7V11H12V6L16 10L12 14V13Z" fill="#bdc3c7"/>
              </svg>
              <p>No hay sistemas de pensión registrados</p>
              <button class="btn-crear-primero" onclick="document.getElementById('btnNuevoSistema').click()">
                Crear el primer sistema
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    sistemas.forEach(sistema => {
      const fila = document.createElement('tr');
      
      // Crear detalles según el tipo
      let detalles = '';
      if (sistema.tipo === 'AFP') {
        detalles = `Fondo: ${sistema.fondo || 0}% | Comisión: ${sistema.comision || 0}% | Seguro: ${sistema.seguro || 0}%`;
      } else if (sistema.tipo === 'ONP') {
        detalles = `Descuento: ${sistema.porcentaje || 0}% sobre remuneración`;
      }
      
      fila.innerHTML = `
        <td>
          <div class="sistema-info">
            <div class="nombre-sistema">${sistema.nombre}</div>
            ${sistema.codigo_sap ? `<div class="codigo-sap">Código SAP: ${sistema.codigo_sap}</div>` : ''}
          </div>
        </td>
        <td>
          <span class="tipo-sistema ${sistema.tipo.toLowerCase() === 'afp' ? 'tipo-afp' : 'tipo-onp'}">
            ${sistema.tipo}
          </span>
        </td>
        <td>
          <div class="detalles-sistema" title="${detalles}">
            ${detalles}
          </div>
        </td>
        </td>
        <td>
          <button class="btn-accion btn-editar" data-id="${sistema.id_sistema_pension}" title="Editar sistema">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Editar
          </button>
          <button class="btn-accion btn-eliminar" data-id="${sistema.id_sistema_pension}" title="Eliminar sistema">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Eliminar
          </button>
        </td>
      `;
      
      tbody.appendChild(fila);
    });

    // Agregar event listeners a los botones de acción
    this.initActionButtons();
  }

  initActionButtons() {
    const botonesEditar = document.querySelectorAll('.btn-editar');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');

    botonesEditar.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.editarSistema(id);
      });
    });

    botonesEliminar.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.eliminarSistema(id);
      });
    });
  }

  async editarSistema(id) {
    try {
      console.log('Editando sistema con ID:', id);
      
      // Mostrar loading en el botón mientras se cargan los datos
      const btnEditar = document.querySelector(`.btn-editar[data-id="${id}"]`);
      let textoOriginal = '';
      
      if (btnEditar) {
        textoOriginal = btnEditar.innerHTML;
        btnEditar.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Cargando...
        `;
        btnEditar.disabled = true;
      }
      
      // Obtener los datos del sistema
      const sistema = await window.electronAPI.obtenerSistemaPensionPorId(id);
      
      console.log('Datos del sistema para editar:', sistema);
      
      // Abrir modal en modo edición
      this.abrirModal(sistema);
      
      // Restaurar el botón inmediatamente después de abrir el modal
      if (btnEditar) {
        btnEditar.innerHTML = textoOriginal;
        btnEditar.disabled = false;
      }
      
    } catch (error) {
      console.error('Error al obtener datos del sistema:', error);
      this.mostrarError('Error al cargar los datos del sistema: ' + error.message);
      
      // Asegurar que el botón se restaure incluso si hay error
      const btnEditar = document.querySelector(`.btn-editar[data-id="${id}"]`);
      if (btnEditar) {
        btnEditar.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Editar
        `;
        btnEditar.disabled = false;
      }
    }
  }

  async eliminarSistema(id) {
    if (confirm('¿Está seguro de que desea eliminar este sistema de pensión?')) {
      try {
        console.log('Eliminando sistema con ID:', id);
        
        // Eliminar usando el servicio real
        await window.electronAPI.eliminarSistemaPension(id);
        
        this.mostrarExito('Sistema de pensión eliminado exitosamente');
        
        // Recargar tabla
        await this.cargarSistemas();
        
      } catch (error) {
        console.error('Error al eliminar sistema:', error);
        this.mostrarError('Error al eliminar el sistema: ' + error.message);
      }
    }
  }

  mostrarExito(mensaje) {
    this.mostrarToast(mensaje, 'success');
  }

  mostrarError(mensaje) {
    this.mostrarToast(mensaje, 'error');
  }

  mostrarInfo(mensaje) {
    this.mostrarToast(mensaje, 'info');
  }

  mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo} sistema-pensiones-toast`;
    toast.textContent = mensaje;
    
    const colores = {
      success: '#27ae60',
      error: '#e74c3c',
      info: '#3498db'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colores[tipo]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      font-size: 0.9rem;
      font-weight: 500;
      max-width: 350px;
      word-wrap: break-word;
      animation: slideInRight 0.3s ease;
    `;
    
    // Agregar animación CSS
    if (!document.querySelector('#toast-styles-sistema-pensiones')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles-sistema-pensiones';
      styles.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, tipo === 'error' ? 5000 : 3000);
  }

  // Método para limpiar completamente el estado del modal
  limpiarEstadoModal() {
    // Limpiar referencias de modo edición
    this.modoEdicion = false;
    this.sistemaEnEdicion = null;
    
    // Limpiar formulario
    if (this.form) {
      this.form.reset();
    }
    
    // Limpiar inputs manualmente
    const inputs = this.form?.querySelectorAll('input, select');
    inputs?.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
      input.disabled = false;
    });
    
    // Limpiar botones
    const botones = this.form?.querySelectorAll('button');
    botones?.forEach(btn => {
      btn.disabled = false;
    });
    
    // Ocultar secciones dinámicas
    if (this.detallesAfp) {
      this.detallesAfp.style.display = 'none';
    }
    if (this.detallesOnp) {
      this.detallesOnp.style.display = 'none';
    }
    
    // Restaurar overflow del body
    document.body.style.overflow = '';
  }
}

// Hacer la clase disponible globalmente
window.SistemaPensionesManager = SistemaPensionesManager;

// Inicializar cuando se carga la vista de sistema-pensiones
if (document.querySelector('.sistema-pensiones-container')) {
  // Asegurar que no haya instancias previas
  if (window.sistemaPensionesInstance) {
    window.sistemaPensionesInstance = null;
  }
  
  // Crear nueva instancia
  window.sistemaPensionesInstance = new SistemaPensionesManager();
}
