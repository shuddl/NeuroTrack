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
});
