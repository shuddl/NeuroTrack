const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const CognitiveEnhancementModule = require('../CognitiveEnhancementModule');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

describe('CognitiveEnhancementModule', () => {
  let eventBus;
  let cognitiveEnhancementModule;

  beforeEach(() => {
    eventBus = new EventBus();
    cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
  });

  it('should schedule a break after X minutes of continuous goal focus', (done) => {
    const breakScheduledSpy = sinon.spy();
    eventBus.subscribe('BreakScheduled', breakScheduledSpy);

    // Simulate goal focus
    cognitiveEnhancementModule.startGoalFocusTimer();

    setTimeout(() => {
      expect(breakScheduledSpy.calledOnce).to.be.true;
      done();
    }, 1500 * 1000); // 25 minutes
  });

  it('should publish an event for UI rendering', (done) => {
    const breakScheduledSpy = sinon.spy();
    eventBus.subscribe('BreakScheduled', breakScheduledSpy);

    // Simulate goal focus
    cognitiveEnhancementModule.startGoalFocusTimer();

    setTimeout(() => {
      expect(breakScheduledSpy.calledOnce).to.be.true;
      done();
    }, 1500 * 1000); // 25 minutes
  });

  it('should track user compliance', async () => {
    const complianceSpy = sinon.spy(BehavioralEventsDAO, 'insertRecord');

    // Simulate user accepting the break
    await cognitiveEnhancementModule.trackCompliance(true);

    expect(complianceSpy.calledOnce).to.be.true;
    expect(complianceSpy.args[0][0]).to.equal('BreakCompliance');
    expect(JSON.parse(complianceSpy.args[0][1])).to.deep.include({ accepted: true });

    complianceSpy.restore();
  });

  it('should store compliance data in BehavioralEventsDAO', async () => {
    const complianceSpy = sinon.spy(BehavioralEventsDAO, 'insertRecord');

    // Simulate user accepting the break
    await cognitiveEnhancementModule.trackCompliance(true);

    expect(complianceSpy.calledOnce).to.be.true;
    expect(complianceSpy.args[0][0]).to.equal('BreakCompliance');
    expect(JSON.parse(complianceSpy.args[0][1])).to.deep.include({ accepted: true });

    complianceSpy.restore();
  });

  it('should handle skipped breaks with a "skippedBreak" penalty', async () => {
    const complianceSpy = sinon.spy(BehavioralEventsDAO, 'insertRecord');

    // Simulate user skipping the break
    await cognitiveEnhancementModule.trackCompliance(false);

    expect(complianceSpy.calledOnce).to.be.true;
    expect(complianceSpy.args[0][0]).to.equal('BreakCompliance');
    expect(JSON.parse(complianceSpy.args[0][1])).to.deep.include({ accepted: false });
    expect(cognitiveEnhancementModule.skippedBreaks).to.equal(1);

    complianceSpy.restore();
  });
});
