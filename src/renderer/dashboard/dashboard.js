// Navegación interna con vanilla JS
document.addEventListener('DOMContentLoaded', () => {
	const main = document.getElementById('dashboardMain');
	const links = document.querySelectorAll('.sidebar-link');

	links.forEach(link => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();
			links.forEach(l => l.classList.remove('active'));
			link.classList.add('active');
			const section = link.getAttribute('data-section');
			
			if (section === 'dashboard') {
				main.innerHTML = `<h1>Bienvenido al Dashboard</h1><p>¡Login exitoso! agregasas</p>`;
			} else if (section === 'trabajadores') {
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
			} else {
				main.innerHTML = `<h1>${link.textContent}</h1><p>En construcción...</p>`;
			}
		});
	});
});

// Aquí puedes agregar la lógica del dashboard para futuras funcionalidades
