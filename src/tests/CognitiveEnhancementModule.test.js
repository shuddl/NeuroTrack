const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const CognitiveEnhancementModule = require('../CognitiveEnhancementModule');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

describe('CognitiveEnhancementModule', () => {
  let eventBus;
  let cognitiveEnhancementModule;
  let behavioralEventsDAO;

  beforeEach(() => {
    eventBus = new EventBus();
    cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
    behavioralEventsDAO = new BehavioralEventsDAO();
  });

  it('should schedule a break after X minutes of continuous goal focus', (done) => {
    const goalFocusTime = 25 * 60 * 1000; // 25 minutes in milliseconds
    cognitiveEnhancementModule.handleGoalFocusTimeUpdate(goalFocusTime);

    setTimeout(() => {
      expect(cognitiveEnhancementModule.breakTimer).to.not.be.null;
      done();
    }, 100);
  });

  it('should publish BreakScheduled event for the UI', (done) => {
    const breakScheduledSpy = sinon.spy();
    eventBus.subscribe('BreakScheduled', breakScheduledSpy);

    cognitiveEnhancementModule.scheduleBreak();

    setTimeout(() => {
      expect(breakScheduledSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });

  it('should track user compliance and store in BehavioralEventsDAO', async () => {
    const isCompliant = true;
    await cognitiveEnhancementModule.trackCompliance(isCompliant);

    const records = await behavioralEventsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ event_type: 'BreakAccepted' });
  });

  it('should track skipped break penalty when user skips breaks', async () => {
    await cognitiveEnhancementModule.skipBreak();

    const records = await behavioralEventsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ event_type: 'SkippedBreak' });
  });

  it('should implement personalized break schedules based on user behavior and preferences', () => {
    const userPreferences = {
      breakInterval: 20 * 60 * 1000, // 20 minutes
      breakDuration: 10 * 60 * 1000 // 10 minutes
    };

    cognitiveEnhancementModule.implementPersonalizedBreakSchedules(userPreferences);

    expect(cognitiveEnhancementModule.breakInterval).to.equal(userPreferences.breakInterval);
    expect(cognitiveEnhancementModule.breakDuration).to.equal(userPreferences.breakDuration);
  });

  it('should adjust break intervals dynamically based on real-time user data and feedback', () => {
    const realTimeData = {
      productivityLevel: 0.4
    };

    cognitiveEnhancementModule.adjustBreakIntervalsDynamically(realTimeData);

    expect(cognitiveEnhancementModule.breakInterval).to.be.lessThan(25 * 60 * 1000); // Less than 25 minutes
  });
});
