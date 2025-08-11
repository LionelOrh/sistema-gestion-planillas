document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value;
  const clave = document.getElementById('clave').value;
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = '';
  try {
    const result = await window.electronAPI.login(usuario, clave);
    if (result) {
      // El main process abrirá el dashboard y cerrará esta ventana
    } else {
      errorDiv.textContent = 'Usuario o contraseña incorrectos';
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexión';
  }
});
