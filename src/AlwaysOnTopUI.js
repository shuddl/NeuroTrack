const { BrowserWindow } = require('electron');
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
  }
}

module.exports = AlwaysOnTopUI;
