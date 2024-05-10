'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { processZip } = require('./modules/renamer.js');

let mainWindow;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    resizable: false,
    title: "Jury Book Renamer",
    movable: true,
    // transparent: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, './modules/preload.js'),
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('./app/site/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit(0);
});

// async function processZip(originalZipPath) {
//   console.log('Do things here');
// }

ipcMain.handle('process-zip-file', async (event, filePath) => {
  const outputLog = [];
  try {
      await processZip(filePath, outputLog);
      return { success: true, log: outputLog };
  } catch (error) {
      return { success: false, error: error.message, log: outputLog };
  }
});





try {
  require('electron-reloader')(module)
} catch (_) { }


