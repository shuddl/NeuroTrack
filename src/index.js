const EventBus = require('./eventBus');
const FocusTrackingEngine = require('./FocusTrackingEngine');
const BehavioralModificationEngine = require('./BehavioralModificationEngine');
const CognitiveEnhancementModule = require('./CognitiveEnhancementModule');
const DataAndMLPipeline = require('./DataAndMLPipeline');
const AlwaysOnTopUI = require('./AlwaysOnTopUI');
const FocusRecordsDAO = require('./FocusRecordsDAO');

// Initialize the event bus
const eventBus = new EventBus();

// Initialize the modules
const focusTrackingEngine = new FocusTrackingEngine(eventBus);
const behavioralModificationEngine = new BehavioralModificationEngine(eventBus);
const cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
const dataAndMLPipeline = new DataAndMLPipeline(eventBus);
const alwaysOnTopUI = new AlwaysOnTopUI(eventBus);
const focusRecordsDAO = new FocusRecordsDAO();

// Subscribe to focus/idle events from FocusTrackingEngine and write them to the local DB using FocusRecordsDAO
eventBus.subscribe('focusChange', (data) => {
  console.log('Focus Change Event:', data);
  focusRecordsDAO.addRecord(data);
});

eventBus.subscribe('idleChange', (data) => {
  console.log('Idle Change Event:', data);
  focusRecordsDAO.addRecord(data);
});

// Bootstrap the application
function bootstrap() {
  console.log('Hello World');
  eventBus.publish('appStarted', { message: 'Application has started' });
}

bootstrap();
