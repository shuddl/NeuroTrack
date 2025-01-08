const { app, BrowserWindow } = require('electron');
const path = require('path');
const EventBus = require('./eventBus');
const FocusTrackingEngine = require('./FocusTrackingEngine');
const BehavioralModificationEngine = require('./BehavioralModificationEngine');
const CognitiveEnhancementModule = require('./CognitiveEnhancementModule');
const DataAndMLPipeline = require('./DataAndMLPipeline');
const AlwaysOnTopUI = require('./AlwaysOnTopUI');
const TimerManager = require('./TimerManager');

// Initialize the event bus
const eventBus = new EventBus();

// Initialize the modules
const focusTrackingEngine = new FocusTrackingEngine(eventBus);
const behavioralModificationEngine = new BehavioralModificationEngine(eventBus);
const cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
const dataAndMLPipeline = new DataAndMLPipeline(eventBus);
const alwaysOnTopUI = new AlwaysOnTopUI(eventBus);
const timerManager = new TimerManager();

// Load the TensorFlow.js model when the application starts
dataAndMLPipeline.loadModel();

// Initialize databases
focusTrackingEngine.initializeDatabase();
behavioralModificationEngine.initializeDatabase();
cognitiveEnhancementModule.initializeDatabase();
timerManager.initializeDatabase();

// Subscribe to focus/idle events from FocusTrackingEngine and log them
eventBus.subscribe('focusChange', (data) => {
  console.log('Focus Change Event:', data);
  // Trigger the ML pipeline on focus change
  dataAndMLPipeline.handleFocusEvent(data);
});

eventBus.subscribe('idleChange', (data) => {
  console.log('Idle Change Event:', data);
});

// Subscribe to daily session events and trigger the ML pipeline
eventBus.subscribe('dailySession', (data) => {
  console.log('Daily Session Event:', data);
  dataAndMLPipeline.handleDailySession(data);
});

// Subscribe to break events from CognitiveEnhancementModule
eventBus.subscribe('BreakScheduled', (data) => {
  console.log('Break Scheduled Event:', data);
});

eventBus.subscribe('BreakCompliance', (data) => {
  console.log('Break Compliance Event:', data);
});

// Create a new BrowserWindow and load index.html
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'ui', 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));
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
