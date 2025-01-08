const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class AlwaysOnTopUI {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.window = null;
    this.createWindow();
    this.setupEventListeners();
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 300,
      height: 200,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    this.window.loadFile('index.html');
  }

  setupEventListeners() {
    this.eventBus.subscribe('focusChange', (data) => {
      this.updateUI(data);
    });

    this.eventBus.subscribe('idleChange', (data) => {
      this.updateUI(data);
    });

    ipcMain.on('acceptPrompt', (event, data) => {
      console.log('Prompt accepted:', data);
    });

    ipcMain.on('dismissPrompt', (event, data) => {
      console.log('Prompt dismissed:', data);
    });
  }

  updateUI(data) {
    const color = this.getColorForState(data.userState);
    this.window.webContents.send('updateState', { ...data, color });
  }

  getColorForState(state) {
    switch (state) {
      case 'FOCUS':
        return '#00FF00'; // Green for focus
      case 'BREAK':
        return '#FFFF00'; // Yellow for break
      case 'HIGH_DISTRACTION':
        return '#FF0000'; // Red for high distraction
      default:
        return '#FFFFFF'; // White for unknown state
    }
  }
}

module.exports = AlwaysOnTopUI;

app.on('ready', () => {
  const eventBus = new (require('./eventBus'))();
  new AlwaysOnTopUI(eventBus);
});
