class ConceptosManager {
  constructor() {
    this.modal = null;
    this.form = null;
    this.conceptos = [];
    this.modoEdicion = false;
    this.conceptoIdEdicion = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupModalElements();
    await this.cargarConceptos();
  }

  setupModalElements() {
    this.modal = document.getElementById('modal-concepto');
    this.form = document.getElementById('form-concepto');
  }

  setupEventListeners() {
    // Botón Nuevo Concepto
    const btnNuevo = document.querySelector('.btn-nuevo-concepto');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => this.abrirModal());
    }

    // Cerrar modal
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('conceptos-modal-close') || 
          e.target.classList.contains('conceptos-btn-cancelar') ||
          e.target.classList.contains('conceptos-modal-overlay')) {
        this.cerrarModal();
      }
    });

    // Prevenir cierre al hacer clic dentro del modal
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('conceptos-modal-container')) {
        e.stopPropagation();
      }
    });

    // Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.cerrarModal();
      }
    });

    // Cambio de tipo de cálculo (monto fijo vs porcentaje)
    document.addEventListener('change', (e) => {
      if (e.target.id === 'tipo-calculo') {
        this.manejarCambioTipoCalculo(e.target.value);
      }
    });

    // Envío del formulario
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'form-concepto') {
        e.preventDefault();
        if (this.modoEdicion) {
          this.actualizarConcepto();
        } else {
          this.crearConcepto();
        }
      }
    });

    // Establecer fecha de inicio por defecto (hoy)
    document.addEventListener('DOMContentLoaded', () => {
      const fechaInicio = document.getElementById('fecha-inicio');
      if (fechaInicio) {
        fechaInicio.value = new Date().toISOString().split('T')[0];
      }
    });
  }

  abrirModal(conceptoId = null) {
    if (this.modal) {
      // Determinar si es modo edición
      this.modoEdicion = conceptoId !== null;
      this.conceptoIdEdicion = conceptoId;

      // Resetear formulario
      if (this.form) {
        this.form.reset();
        
        if (!this.modoEdicion) {
          // Solo en modo creación: establecer valores por defecto
          const fechaInicio = document.getElementById('fecha-inicio');
          if (fechaInicio) {
            fechaInicio.value = new Date().toISOString().split('T')[0];
          }

          const conceptoActivo = document.getElementById('concepto-activo');
          if (conceptoActivo) {
            conceptoActivo.checked = true;
          }
        }
      }

      // Ocultar campos dinámicos
      this.ocultarCamposDinamicos();

      // Actualizar título y botón del modal
      const titulo = document.querySelector('.conceptos-modal-header h2');
      const botonCrear = document.querySelector('.conceptos-btn-crear');
      
      if (this.modoEdicion) {
        if (titulo) titulo.textContent = 'Editar Concepto';
        if (botonCrear) botonCrear.textContent = 'Actualizar Concepto';
      } else {
        if (titulo) titulo.textContent = 'Nuevo Concepto';
        if (botonCrear) botonCrear.textContent = 'Crear Concepto';
      }

      // Mostrar modal
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Focus en el primer campo
      const primerCampo = document.getElementById('nombre-concepto');
      if (primerCampo) {
        setTimeout(() => primerCampo.focus(), 100);
      }
    }
  }

  cerrarModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      
      // Limpiar variables de edición
      this.modoEdicion = false;
      this.conceptoIdEdicion = null;
      
      // Limpiar formulario después de la animación
      setTimeout(() => {
        if (this.form) {
          this.form.reset();
          this.ocultarCamposDinamicos();
        }
        
        // Restaurar título y botón por defecto
        const titulo = document.querySelector('.conceptos-modal-header h2');
        const botonCrear = document.querySelector('.conceptos-btn-crear');
        
        if (titulo) titulo.textContent = 'Nuevo Concepto';
        if (botonCrear) botonCrear.textContent = 'Crear Concepto';
      }, 300);
    }
  }

  manejarCambioTipoCalculo(valor) {
    const campoMonto = document.getElementById('campo-monto');
    const campoPorcentaje = document.getElementById('campo-porcentaje');
    const inputMonto = document.getElementById('monto-fijo');
    const inputPorcentaje = document.getElementById('porcentaje');

    // Ocultar ambos campos inmediatamente
    this.ocultarCamposDinamicosInmediato();

    // Mostrar el campo correspondiente con un delay más largo para evitar conflictos
    if (valor === 'monto-fijo') {
      setTimeout(() => {
        if (campoMonto) {
          campoMonto.style.display = 'block';
          // Forzar el reflow antes de agregar la clase
          campoMonto.offsetHeight;
          campoMonto.classList.add('show');
        }
        if (inputMonto) {
          inputMonto.required = true;
        }
        if (inputPorcentaje) {
          inputPorcentaje.required = false;
        }
      }, 100);
    } else if (valor === 'porcentaje') {
      setTimeout(() => {
        if (campoPorcentaje) {
          campoPorcentaje.style.display = 'block';
          // Forzar el reflow antes de agregar la clase
          campoPorcentaje.offsetHeight;
          campoPorcentaje.classList.add('show');
        }
        if (inputPorcentaje) {
          inputPorcentaje.required = true;
        }
        if (inputMonto) {
          inputMonto.required = false;
        }
      }, 100);
    }
  }

  ocultarCamposDinamicos() {
    const campoMonto = document.getElementById('campo-monto');
    const campoPorcentaje = document.getElementById('campo-porcentaje');
    const inputMonto = document.getElementById('monto-fijo');
    const inputPorcentaje = document.getElementById('porcentaje');

    // Remover clases y ocultar con animación
    [campoMonto, campoPorcentaje].forEach(campo => {
      if (campo) {
        campo.classList.remove('show');
        setTimeout(() => {
          campo.style.display = 'none';
        }, 300);
      }
    });

    // Limpiar required y valores
    if (inputMonto) {
      inputMonto.required = false;
      inputMonto.value = '';
    }
    if (inputPorcentaje) {
      inputPorcentaje.required = false;
      inputPorcentaje.value = '';
    }
  }

  ocultarCamposDinamicosInmediato() {
    const campoMonto = document.getElementById('campo-monto');
    const campoPorcentaje = document.getElementById('campo-porcentaje');
    const inputMonto = document.getElementById('monto-fijo');
    const inputPorcentaje = document.getElementById('porcentaje');

    // Ocultar inmediatamente sin animación
    [campoMonto, campoPorcentaje].forEach(campo => {
      if (campo) {
        campo.classList.remove('show');
        campo.style.display = 'none';
      }
    });

    // Limpiar required y valores
    if (inputMonto) {
      inputMonto.required = false;
    }
    if (inputPorcentaje) {
      inputPorcentaje.required = false;
    }
  }

  async crearConcepto() {
    try {
      // Validar formulario
      if (!this.validarFormulario()) {
        return;
      }

      // Recopilar datos del formulario
      const formData = new FormData(this.form);
      const conceptoData = this.procesarDatosFormulario(formData);

      console.log('Datos del concepto a crear:', conceptoData);

      // Cambiar texto del botón
      const btnCrear = document.querySelector('.conceptos-btn-crear');
      const textoOriginal = btnCrear.textContent;
      btnCrear.textContent = 'Creando...';
      btnCrear.disabled = true;

      // Llamar a la API para crear el concepto
      const resultado = await window.electronAPI.crearConcepto(conceptoData);

      this.mostrarExito('Concepto creado exitosamente');
      this.cerrarModal();

      // Recargar lista de conceptos
      await this.cargarConceptos();

    } catch (error) {
      console.error('Error al crear concepto:', error);
      this.mostrarError('Error al crear el concepto: ' + error.message);
    } finally {
      // Restaurar botón
      const btnCrear = document.querySelector('.conceptos-btn-crear');
      if (btnCrear) {
        btnCrear.textContent = 'Crear Concepto';
        btnCrear.disabled = false;
      }
    }
  }

  async actualizarConcepto() {
    try {
      // Validar formulario
      if (!this.validarFormulario()) {
        return;
      }

      // Recopilar datos del formulario
      const formData = new FormData(this.form);
      const conceptoData = this.procesarDatosFormulario(formData);

      console.log('Datos del concepto a actualizar:', conceptoData);

      // Cambiar texto del botón
      const btnCrear = document.querySelector('.conceptos-btn-crear');
      const textoOriginal = btnCrear.textContent;
      btnCrear.textContent = 'Actualizando...';
      btnCrear.disabled = true;

      // Llamar a la API para actualizar el concepto
      const resultado = await window.electronAPI.actualizarConcepto(this.conceptoIdEdicion, conceptoData);

      this.mostrarExito('Concepto actualizado exitosamente');
      this.cerrarModal();

      // Recargar lista de conceptos
      await this.cargarConceptos();

    } catch (error) {
      console.error('Error al actualizar concepto:', error);
      this.mostrarError('Error al actualizar el concepto: ' + error.message);
    } finally {
      // Restaurar botón
      const btnCrear = document.querySelector('.conceptos-btn-crear');
      if (btnCrear) {
        btnCrear.textContent = this.modoEdicion ? 'Actualizar Concepto' : 'Crear Concepto';
        btnCrear.disabled = false;
      }
    }
  }

  procesarDatosFormulario(formData) {
    const data = Object.fromEntries(formData);
    
    console.log('Datos del FormData:', data);
    
    // Mapear nombres de campos del formulario a nombres de la API
    const conceptoData = {
      nombre: data['nombre']?.trim() || '',
      codigo: data['codigo']?.trim() || '',
      tipo: data['tipo'] || '',
      tipoCalculo: data['tipoCalculo'] || '',
      codigoContable: data['codigoContable']?.trim() || null,
      fechaInicio: data['fechaInicio'] || null,
      fechaFin: data['fechaFin']?.trim() || null,
      esRemunerativo: formData.has('esRemunerativo'),
      activo: formData.has('activo')
    };

    // Procesar valor según tipo de cálculo
    if (conceptoData.tipoCalculo === 'monto-fijo') {
      conceptoData.valor = parseFloat(data['montoFijo']) || 0;
    } else if (conceptoData.tipoCalculo === 'porcentaje') {
      conceptoData.valor = parseFloat(data['porcentaje']) || 0;
    } else {
      conceptoData.valor = 0;
    }

    // Limpiar campos vacíos para que se envíen como null (excepto campos requeridos)
    Object.keys(conceptoData).forEach(key => {
      if (conceptoData[key] === '' && key !== 'nombre' && key !== 'codigo' && key !== 'tipo' && key !== 'tipoCalculo') {
        conceptoData[key] = null;
      }
    });

    console.log('Datos procesados del formulario:', conceptoData);
    return conceptoData;
  }

  validarFormulario() {
    const campos = [
      { id: 'nombre-concepto', nombre: 'Nombre del concepto' },
      { id: 'codigo-concepto', nombre: 'Código' },
      { id: 'tipo-concepto', nombre: 'Tipo de concepto' },
      { id: 'tipo-calculo', nombre: 'Tipo de cálculo' },
      { id: 'fecha-inicio', nombre: 'Fecha de inicio' }
    ];

    for (let campo of campos) {
      const elemento = document.getElementById(campo.id);
      if (!elemento || !elemento.value.trim()) {
        this.mostrarError(`El campo "${campo.nombre}" es requerido`);
        elemento?.focus();
        return false;
      }
    }

    // Validar campo de valor según tipo de cálculo
    const tipoCalculo = document.getElementById('tipo-calculo').value;
    if (tipoCalculo === 'monto-fijo') {
      const montoFijo = document.getElementById('monto-fijo');
      if (!montoFijo.value || parseFloat(montoFijo.value) < 0) {
        this.mostrarError('Debe ingresar un monto fijo válido');
        montoFijo.focus();
        return false;
      }
    } else if (tipoCalculo === 'porcentaje') {
      const porcentaje = document.getElementById('porcentaje');
      if (!porcentaje.value || parseFloat(porcentaje.value) < 0 || parseFloat(porcentaje.value) > 100) {
        this.mostrarError('Debe ingresar un porcentaje válido (0-100)');
        porcentaje.focus();
        return false;
      }
    }

    // Validar fechas
    const fechaInicio = document.getElementById('fecha-inicio').value;
    const fechaFin = document.getElementById('fecha-fin').value;
    
    if (fechaFin && fechaFin <= fechaInicio) {
      this.mostrarError('La fecha de fin debe ser posterior a la fecha de inicio');
      document.getElementById('fecha-fin').focus();
      return false;
    }

    return true;
  }

  async cargarConceptos() {
    try {
      // Mostrar indicador de carga
      this.mostrarCargando(true);

      // Obtener conceptos desde la API
      this.conceptos = await window.electronAPI.obtenerConceptos();
      console.log('Conceptos cargados:', this.conceptos);

      // Renderizar la tabla
      this.renderizarTablaConceptos();

    } catch (error) {
      console.error('Error al cargar conceptos:', error);
      this.mostrarError('Error al cargar la lista de conceptos');
    } finally {
      this.mostrarCargando(false);
    }
  }

  renderizarTablaConceptos() {
    const tbody = document.querySelector('.conceptos-tabla tbody');
    if (!tbody) {
      console.error('No se encontró la tabla de conceptos');
      return;
    }

    if (this.conceptos.length === 0) {
      tbody.innerHTML = `
        <tr class="conceptos-fila-vacia">
          <td colspan="7" class="conceptos-text-center">
            <div class="conceptos-empty-state">
              <p>No hay conceptos registrados</p>
              <button class="conceptos-btn conceptos-btn-primary btn-nuevo-concepto">
                Crear primer concepto
              </button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.conceptos.map(concepto => `
      <tr class="conceptos-fila" data-id="${concepto.id_concepto}">
        <td class="conceptos-celda">${concepto.codigo}</td>
        <td class="conceptos-celda">
          <div class="conceptos-nombre-container">
            <div class="conceptos-nombre-principal">${concepto.nombre}</div>
            <div class="conceptos-nombre-subtexto">
              ${concepto.es_remunerativo ? 'Remunerativo' : 'No Remunerativo'}
            </div>
          </div>
        </td>
        <td class="conceptos-celda">
          <span class="conceptos-badge conceptos-badge-${concepto.tipo}">
            ${this.formatearTipo(concepto.tipo)}
          </span>
        </td>
        <td class="conceptos-celda">
          <span class="conceptos-badge conceptos-badge-secondary">
            ${this.formatearTipoCalculo(concepto.tipo_calculo)}
          </span>
        </td>
        <td class="conceptos-celda">
          ${concepto.tipo_calculo === 'monto-fijo' 
            ? `S/. ${parseFloat(concepto.valor).toFixed(2)}` 
            : `${parseFloat(concepto.valor).toFixed(2)}%`}
        </td>
        <td class="conceptos-celda">
          <span class="conceptos-badge ${concepto.activo ? 'conceptos-badge-success' : 'conceptos-badge-danger'}">
            ${concepto.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td class="conceptos-celda-acciones">
          <div class="conceptos-acciones">
            <button class="conceptos-btn conceptos-btn-sm conceptos-btn-outline" 
                    onclick="conceptosManager.editarConcepto(${concepto.id_concepto})" 
                    title="Editar">
              ✏️
            </button>
            <button class="conceptos-btn conceptos-btn-sm conceptos-btn-danger" 
                    onclick="conceptosManager.eliminarConcepto(${concepto.id_concepto})" 
                    title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Reattach event listeners para el botón "Crear primer concepto"
    const btnNuevo = tbody.querySelector('.btn-nuevo-concepto');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => this.abrirModal());
    }
  }

  formatearTipo(tipo) {
    const tipos = {
      'ingreso': 'Ingreso',
      'descuento': 'Descuento',
      'aporte-trabajador': 'Aporte Trabajador',
      'aporte-empleador': 'Aporte Empleador'
    };
    return tipos[tipo] || tipo;
  }

  formatearTipoCalculo(tipoCalculo) {
    const tipos = {
      'monto-fijo': 'Monto Fijo',
      'porcentaje': 'Porcentaje'
    };
    return tipos[tipoCalculo] || tipoCalculo;
  }

  async editarConcepto(id) {
    try {
      // Obtener datos del concepto
      const concepto = await window.electronAPI.obtenerConceptoPorId(id);
      
      // Abrir el modal en modo edición
      this.abrirModal(id);
      
      // Llenar el formulario con los datos después de un delay más largo
      // para asegurar que el modal esté completamente abierto
      setTimeout(() => {
        this.llenarFormularioParaEdicion(concepto);
      }, 200);
      
    } catch (error) {
      console.error('Error al cargar concepto para edición:', error);
      this.mostrarError('Error al cargar los datos del concepto');
    }
  }

  llenarFormularioParaEdicion(concepto) {
    // Llenar campos básicos
    document.getElementById('nombre-concepto').value = concepto.nombre || '';
    document.getElementById('codigo-concepto').value = concepto.codigo || '';
    document.getElementById('tipo-concepto').value = concepto.tipo || '';
    document.getElementById('tipo-calculo').value = concepto.tipo_calculo || '';
    document.getElementById('codigo-contable').value = concepto.codigo_contable || '';
    
    // Formatear fechas para campos input[type="date"]
    if (concepto.fecha_inicio) {
      const fechaInicio = new Date(concepto.fecha_inicio);
      document.getElementById('fecha-inicio').value = fechaInicio.toISOString().split('T')[0];
    }
    
    if (concepto.fecha_fin) {
      const fechaFin = new Date(concepto.fecha_fin);
      document.getElementById('fecha-fin').value = fechaFin.toISOString().split('T')[0];
    }
    
    // Checkboxes
    document.getElementById('es-remunerativo').checked = concepto.es_remunerativo || false;
    document.getElementById('concepto-activo').checked = concepto.activo !== false;
    
    // Manejar campos de valor según tipo de cálculo - con delay para asegurar que se muestren
    if (concepto.tipo_calculo === 'monto-fijo') {
      this.manejarCambioTipoCalculo('monto-fijo');
      setTimeout(() => {
        const montoInput = document.getElementById('monto-fijo');
        if (montoInput) {
          montoInput.value = concepto.valor || '';
        }
      }, 150);
    } else if (concepto.tipo_calculo === 'porcentaje') {
      this.manejarCambioTipoCalculo('porcentaje');
      setTimeout(() => {
        const porcentajeInput = document.getElementById('porcentaje');
        if (porcentajeInput) {
          porcentajeInput.value = concepto.valor || '';
        }
      }, 150);
    }
  }

  async eliminarConcepto(id) {
    if (confirm('¿Está seguro de que desea eliminar este concepto?')) {
      try {
        await window.electronAPI.eliminarConcepto(id);
        this.mostrarExito('Concepto eliminado exitosamente');
        await this.cargarConceptos();
      } catch (error) {
        console.error('Error al eliminar concepto:', error);
        this.mostrarError('Error al eliminar el concepto');
      }
    }
  }

  mostrarCargando(mostrar) {
    const tabla = document.querySelector('.conceptos-tabla');
    if (mostrar) {
      tabla?.classList.add('conceptos-loading');
    } else {
      tabla?.classList.remove('conceptos-loading');
    }
  }

  mostrarExito(mensaje) {
    // Implementar notificación de éxito
    alert(mensaje); // Temporal
  }

  mostrarError(mensaje) {
    // Implementar notificación de error
    alert(mensaje); // Temporal
  }
}

// Hacer la clase disponible globalmente para reinicialización
window.ConceptosManager = ConceptosManager;

// Inicializar cuando se carga la vista de conceptos
let conceptosManager = null;
if (document.querySelector('.conceptos-gestion')) {
  conceptosManager = new ConceptosManager();
  // Hacer disponible globalmente para los botones de la tabla
  window.conceptosManager = conceptosManager;
}
