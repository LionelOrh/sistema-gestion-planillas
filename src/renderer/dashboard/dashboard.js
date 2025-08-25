// Navegación interna con vanilla JS
document.addEventListener('DOMContentLoaded', () => {
	const main = document.getElementById('dashboardMain');
	const links = document.querySelectorAll('.sidebar-link');
	/**
 * Elimina los estilos CSS de todos los módulos excepto el que se va a cargar
 * @param {string} idCssActual - El id del CSS que se va a cargar (ej: 'planillas-css')
 */
	function renderDashboard() {
		return `
      <div class="dashboard-welcome">
        <div class="dashboard-header">
          <img src="../../assent/LOGO TIC-TECHNOLOGIES 1 (1).svg" alt="Logo TIC-TECHNOLOGIES" class="dashboard-logo">
          <div>
            <h1>Bienvenido a TIC-TECHNOLOGIES</h1>
            <p>
              Sistema de Gestión de Planillas desarrollado por <strong>TIC-TECHNOLOGIES</strong> para facilitar la
              administración de tu empresa.<br>
              Gestiona trabajadores, conceptos, planillas, licencias y más desde un solo lugar, de forma segura y
              eficiente.
            </p>
          </div>
        </div>
      </div>
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="dashboard-card-icon">&#128188;</div>
          <h3>Trabajadores</h3>
          <p>Registra y administra la información de tus empleados de manera centralizada.</p>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-icon">&#128179;</div>
          <h3>Planillas</h3>
          <p>Genera y consulta planillas de pago de forma rápida y sencilla.</p>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-icon">&#128197;</div>
          <h3>Licencias</h3>
          <p>Gestiona permisos y licencias de tus trabajadores con control total.</p>
        </div>
        <div class="dashboard-card">
          <div class="dashboard-card-icon">&#127942;</div>
          <h3>Utilidades</h3>
          <p>Calcula utilidades y gratificaciones automáticamente y sin errores.</p>
        </div>
      </div>
    `;
	}
	main.innerHTML = renderDashboard();

	function limpiarCssModulos(idCssActual) {
		const idsCss = [
			'utilidades-css',
			'planillas-css',
			'trabajadores-css',
			'conceptos-css',
			'sistema-pensiones-css',
			'licencias-css',
			'gratificaciones-css'
		];
		idsCss.forEach(id => {
			if (id !== idCssActual) {
				const link = document.getElementById(id);
				if (link) link.remove();
			}
		});
	}

	links.forEach(link => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();
			links.forEach(l => l.classList.remove('active'));
			link.classList.add('active');
			const section = link.getAttribute('data-section');

			if (section === 'dashboard') {
				main.innerHTML = renderDashboard();
			} else if (section === 'trabajadores') {
				limpiarCssModulos('trabajadores-css');
				// Cargar la vista de trabajadores y su CSS
				const res = await fetch('trabajadores/trabajadores.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('trabajadores-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'trabajadores/trabajadores.css';
					link.id = 'trabajadores-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de trabajadores
				if (!document.getElementById('trabajadores-script')) {
					const script = document.createElement('script');
					script.src = 'trabajadores/trabajadores.js';
					script.id = 'trabajadores-script';
					document.head.appendChild(script);
				} else {
					// Si el script ya está cargado, reinicializar manualmente
					if (window.TrabajadoresManager) {
						new window.TrabajadoresManager();
					}
				}
			} else if (section === 'conceptos') {
				limpiarCssModulos('conceptos-css');
				// Cargar la vista de conceptos y su CSS
				const res = await fetch('conceptos/conceptos.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('conceptos-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'conceptos/conceptos.css';
					link.id = 'conceptos-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de conceptos
				if (!document.getElementById('conceptos-script')) {
					const script = document.createElement('script');
					script.src = 'conceptos/conceptos.js';
					script.id = 'conceptos-script';
					document.head.appendChild(script);
				} else {
					// Si el script ya está cargado, reinicializar manualmente
					if (window.ConceptosManager) {
						new window.ConceptosManager();
					}
				}
			} else if (section === 'sistema-pensiones') {
				limpiarCssModulos('sistema-pensiones-css');
				// Cargar la vista de sistema de pensiones
				const res = await fetch('sistema-pensiones/sistema-pensiones.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('sistema-pensiones-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'sistema-pensiones/sistema-pensiones.css';
					link.id = 'sistema-pensiones-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de sistema de pensiones
				if (!document.getElementById('sistema-pensiones-script')) {
					const script = document.createElement('script');
					script.src = 'sistema-pensiones/sistema-pensiones.js';
					script.id = 'sistema-pensiones-script';
					document.head.appendChild(script);
				} else {
					// Si el script ya está cargado, reinicializar manualmente
					if (window.SistemaPensionesManager) {
						new window.SistemaPensionesManager();
					}
				}
			} else if (section === 'planillas') {
				limpiarCssModulos('planillas-css');
				// Cargar la vista de planillas y su CSS
				const res = await fetch('planillas/planillas.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('planillas-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'planillas/planillas.css';
					link.id = 'planillas-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de planillas
				if (!document.getElementById('planillas-script')) {
					const script = document.createElement('script');
					script.src = 'planillas/planillas.js';
					script.id = 'planillas-script';
					document.head.appendChild(script);
				} else {
					// Si el script ya está cargado, reinicializar manualmente
					if (window.PlanillasManager) {
						new window.PlanillasManager();
					}
				}
			} else if (section === 'licencias') {
				limpiarCssModulos('licencias-css');
				// Cargar la vista de licencias y su CSS
				const res = await fetch('licencias/licencias.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('licencias-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'licencias/licencias.css';
					link.id = 'licencias-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de licencias
				if (!document.getElementById('licencias-script')) {
					const script = document.createElement('script');
					script.src = 'licencias/licencias.js';
					script.id = 'licencias-script';
					document.head.appendChild(script);
				} else {
					// Si el script ya está cargado, reinicializar manualmente
					if (window.LicenciasManager) {
						new window.LicenciasManager();
					}
				}
			} else if (section === 'utilidades') {
				limpiarCssModulos('utilidades-css');
				// Cargar la vista de utilidades y su CSS
				const res = await fetch('utilidades/utilidades.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('utilidades-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'utilidades/utilidades.css';
					link.id = 'utilidades-css';
					document.head.appendChild(link);
				}

				// Elimina el script previo si existe para forzar recarga
				const prevScript = document.getElementById('utilidades-script');
				if (prevScript) prevScript.remove();

				// Cargar y ejecutar el script de utilidades SIEMPRE
				const script = document.createElement('script');
				script.src = 'utilidades/utilidades.js';
				script.id = 'utilidades-script';
				script.onload = () => {
					// Expón la clase en window para reinicialización manual si es necesario
					if (window.UtilidadesManager) {
						new window.UtilidadesManager();
					}
				};
				document.head.appendChild(script);

				// ...existing code...
			} else if (section === 'gratificaciones') {
				limpiarCssModulos('gratificaciones-css');
				// Cargar la vista de gratificaciones y su CSS
				const res = await fetch('gratificaciones/gratificaciones.html');
				const html = await res.text();
				main.innerHTML = html;

				// Cargar CSS solo si no está ya cargado
				if (!document.getElementById('gratificaciones-css')) {
					const link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = 'gratificaciones/gratificaciones.css';
					link.id = 'gratificaciones-css';
					document.head.appendChild(link);
				}

				// Cargar y ejecutar el script de gratificaciones
				if (!document.getElementById('gratificaciones-script')) {
					const script = document.createElement('script');
					script.src = 'gratificaciones/gratificaciones.js';
					script.id = 'gratificaciones-script';
					document.head.appendChild(script);
				}
			} else {
				main.innerHTML = `<h1>${link.textContent}</h1><p>En construcción...</p>`;
			}
		});
	});
});

// Aquí puedes agregar la lógica del dashboard para futuras funcionalidades