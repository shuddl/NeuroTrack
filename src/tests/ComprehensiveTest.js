const { expect } = require('chai');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');
const FocusRecordsDAO = require('../dao/FocusRecordsDAO');
const TimerRecordsDAO = require('../dao/TimerRecordsDAO');
const BehavioralModificationEngine = require('../BehavioralModificationEngine');
const CognitiveEnhancementModule = require('../CognitiveEnhancementModule');
const DataAndMLPipeline = require('../DataAndMLPipeline');
const FocusTrackingEngine = require('../FocusTrackingEngine');
const EventBus = require('../eventBus');

describe('Comprehensive Test', () => {
  let eventBus;
  let behavioralModificationEngine;
  let cognitiveEnhancementModule;
  let dataAndMLPipeline;
  let focusTrackingEngine;

  beforeEach(() => {
    eventBus = new EventBus();
    behavioralModificationEngine = new BehavioralModificationEngine(eventBus);
    cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
    dataAndMLPipeline = new DataAndMLPipeline(eventBus);
    focusTrackingEngine = new FocusTrackingEngine(eventBus);
  });

  it('should import and initialize BehavioralEventsDAO', () => {
    const behavioralEventsDAO = new BehavioralEventsDAO();
    expect(behavioralEventsDAO).to.be.an('object');
  });

  it('should import and initialize FocusRecordsDAO', () => {
    const focusRecordsDAO = new FocusRecordsDAO();
    expect(focusRecordsDAO).to.be.an('object');
  });

  it('should import and initialize TimerRecordsDAO', () => {
    const timerRecordsDAO = new TimerRecordsDAO();
    expect(timerRecordsDAO).to.be.an('object');
  });

  it('should import and initialize BehavioralModificationEngine', () => {
    expect(behavioralModificationEngine).to.be.an('object');
  });

  it('should import and initialize CognitiveEnhancementModule', () => {
    expect(cognitiveEnhancementModule).to.be.an('object');
  });

  it('should import and initialize DataAndMLPipeline', () => {
    expect(dataAndMLPipeline).to.be.an('object');
  });

  it('should import and initialize FocusTrackingEngine', () => {
    expect(focusTrackingEngine).to.be.an('object');
  });

  it('should verify functionality of BehavioralModificationEngine', () => {
    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };
    eventBus.publish('focusChange', focusEvent);
    expect(behavioralModificationEngine.focusIntervals.getItems()).to.have.lengthOf(1);
  });

  it('should verify functionality of CognitiveEnhancementModule', () => {
    const goalFocusTime = 25 * 60 * 1000; // 25 minutes in milliseconds
    cognitiveEnhancementModule.handleGoalFocusTimeUpdate(goalFocusTime);
    expect(cognitiveEnhancementModule.breakTimer).to.not.be.null;
  });

  it('should verify functionality of DataAndMLPipeline', async () => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };
    const prediction = await dataAndMLPipeline.performInference(data);
    expect(prediction).to.not.be.null;
  });

  it('should verify functionality of FocusTrackingEngine', (done) => {
    const focusChangeSpy = sinon.spy();
    eventBus.subscribe('focusChange', focusChangeSpy);
    focusTrackingEngine.handleFocusChange({ activeWindow: 'NewApp' });
    setTimeout(() => {
      expect(focusChangeSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });
});
