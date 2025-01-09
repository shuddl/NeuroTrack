const { app, BrowserWindow, ipcMain } = require('electron');
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

// Initialize the TimerManager database
timerManager.initializeDatabase();

// Subscribe to focus/idle events from FocusTrackingEngine and write them to the local DB using FocusRecordsDAO
eventBus.subscribe('focusChange', (data) => {
  console.log('Focus Change Event:', data);
  dataAndMLPipeline.performInference(data);
});

eventBus.subscribe('idleChange', (data) => {
  console.log('Idle Change Event:', data);
  focusRecordsDAO.addRecord(data);
  behavioralModificationEngine.trackFocusEvent(data);
  cognitiveEnhancementModule.detectDeepWorkSessions(data);
  dataAndMLPipeline.performInference(data);
});

// Subscribe to reward and degradation events from BehavioralModificationEngine and log them to the console
eventBus.subscribe('RewardEvent', (data) => {
  console.log('Reward Event:', data);
});

eventBus.subscribe('productivityDegradation', (data) => {
  console.log('Productivity Degradation Event:', data);
});

// Subscribe to events from CognitiveEnhancementModule and log them to the console
eventBus.subscribe('NeuralPatternDisruptor', (data) => {
  console.log('Neural Pattern Disruptor Event:', data);
});

eventBus.subscribe('MicroBreak', (data) => {
  console.log('Micro Break Event:', data);
});

eventBus.subscribe('ComplianceTracking', (data) => {
  console.log('Compliance Tracking Event:', data);
});

// Subscribe to events from DataAndMLPipeline and log them to the console
eventBus.subscribe('distractionProbabilityUpdated', (data) => {
  console.log('Distraction Probability Updated:', data);
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

// Add event listeners for start-focus-timer event
ipcMain.on('start-focus-timer', (event, focusType) => {
  timerManager.startFocusTimer(focusType);
});

// Store daily totals at the end of the day
const storeDailyTotals = () => {
  const date = new Date().toISOString().split('T')[0];
  timerManager.storeDailyTotals(date);
};

// Schedule daily totals storage at midnight
const scheduleDailyTotalsStorage = () => {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const timeUntilMidnight = nextMidnight - now;
  setTimeout(() => {
    storeDailyTotals();
    scheduleDailyTotalsStorage();
  }, timeUntilMidnight);
};

scheduleDailyTotalsStorage();

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
  console.log('Hello World'); // Log 'Hello World' to the console on app start

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
