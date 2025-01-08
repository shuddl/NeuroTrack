const { app, BrowserWindow } = require('electron');
const path = require('path');
const EventBus = require('./eventBus');
const FocusTrackingEngine = require('./FocusTrackingEngine');
const BehavioralModificationEngine = require('./BehavioralModificationEngine');
const CognitiveEnhancementModule = require('./CognitiveEnhancementModule');
const DataAndMLPipeline = require('./DataAndMLPipeline');
const AlwaysOnTopUI = require('./AlwaysOnTopUI');

// Initialize the event bus
const eventBus = new EventBus();

// Initialize the modules
const focusTrackingEngine = new FocusTrackingEngine(eventBus);
const behavioralModificationEngine = new BehavioralModificationEngine(eventBus);
const cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
const dataAndMLPipeline = new DataAndMLPipeline(eventBus);
const alwaysOnTopUI = new AlwaysOnTopUI(eventBus);

// Subscribe to focus/idle events from FocusTrackingEngine and log them
eventBus.subscribe('focusChange', (data) => {
  console.log('Focus Change Event:', data);
});

eventBus.subscribe('idleChange', (data) => {
  console.log('Idle Change Event:', data);
});

// Create a new BrowserWindow and load index.html
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

// Bootstrap the application
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
