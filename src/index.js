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
  behavioralModificationEngine.trackFocusEvent(data);
  cognitiveEnhancementModule.detectDistractionPatterns(data);
});

eventBus.subscribe('idleChange', (data) => {
  console.log('Idle Change Event:', data);
  focusRecordsDAO.addRecord(data);
  behavioralModificationEngine.trackFocusEvent(data);
  cognitiveEnhancementModule.detectDeepWorkSessions(data);
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

// Bootstrap the application
function bootstrap() {
  console.log('Hello World');
  eventBus.publish('appStarted', { message: 'Application has started' });
}

bootstrap();
