const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class AlwaysOnTopUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.createWindow();
  }

  createWindow() {
    const alwaysOnTopWindow = new BrowserWindow({
      width: 300,
      height: 200,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'ui', 'preload.js')
      }
    });

    alwaysOnTopWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

    ipcMain.on('start-goal-timer', () => {
      this.eventBus.publish('startGoalFocusTimer');
    });

    ipcMain.on('start-non-goal-timer', () => {
      this.eventBus.publish('startNonGoalFocusTimer');
    });

    this.eventBus.subscribe('updateGoalTime', (time) => {
      alwaysOnTopWindow.webContents.send('update-goal-time', time);
    });

    this.eventBus.subscribe('updateNonGoalTime', (time) => {
      alwaysOnTopWindow.webContents.send('update-non-goal-time', time);
    });
  }
}

module.exports = AlwaysOnTopUI;
