const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL('https://csolercay.github.io/Repte2_Desenvolupament_d-Aplicacions_Interactives/');
}

app.whenReady().then(createWindow);
