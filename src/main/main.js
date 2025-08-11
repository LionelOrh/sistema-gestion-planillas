const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { login } = require('../services/loginService');

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
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
