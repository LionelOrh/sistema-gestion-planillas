const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { login } = require('../services/loginService');
const { obtenerTrabajadores } = require('../services/trabajadoresService');

let loginWindow = null;
let dashboardWindow = null;

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  loginWindow.loadFile(path.join(__dirname, '../renderer/login/login.html'));
  loginWindow.on('closed', () => { loginWindow = null; });
}

function createDashboardWindow() {
  dashboardWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    minimizable: true,
    frame: true, // muestra los controles nativos de la ventana
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  dashboardWindow.maximize(); // abre maximizada pero no en fullscreen
  dashboardWindow.loadFile(path.join(__dirname, '../renderer/dashboard/dashboard.html'));
  dashboardWindow.on('closed', () => { dashboardWindow = null; });
}

app.whenReady().then(() => {
  createLoginWindow();

  ipcMain.handle('login', async (event, usuario, clave) => {
    const result = await login(usuario, clave);
    if (result) {
      createDashboardWindow();
      if (loginWindow) loginWindow.close();
    }
    return result;
  });

  // IPC handler para trabajadores
  ipcMain.handle('obtener-trabajadores', async () => {
    console.log('Handler obtener-trabajadores llamado');
    try {
      const result = await obtenerTrabajadores();
      console.log('Datos obtenidos en handler:', result);
      return result;
    } catch (error) {
      console.error('Error en handler obtener-trabajadores:', error);
      throw error;
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
