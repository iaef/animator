import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Corrected path to js after compilation
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    // In development, you might want to point to a dev server (e.g., http://localhost:8080)
    // For this MVP, we'll consistently load the bundled file from 'dist'.
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle Lottie file saving
ipcMain.on('save-lottie', async (event, data) => {
  if (!data) {
    console.error('No data received for save-lottie');
    return;
  }
  
  // Ensure 'dialog' is available. It should be, as it's imported.
  if (!dialog) {
    console.error('Dialog module is not available.');
    return;
  }

  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Lottie JSON',
      defaultPath: 'animation.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log('Lottie file saved to:', filePath);
      // Optionally, send a success message back to the renderer
      // event.sender.send('save-lottie-success', filePath);
    }
  } catch (err) {
    console.error('Failed to save Lottie file or dialog was cancelled:', err);
    // Optionally, send an error message back to the renderer
    // event.sender.send('save-lottie-error', err.message);
  }
});
