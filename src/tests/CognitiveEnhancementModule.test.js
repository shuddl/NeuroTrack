const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const CognitiveEnhancementModule = require('../CognitiveEnhancementModule');

describe('CognitiveEnhancementModule', () => {
  let eventBus;
  let cognitiveEnhancementModule;

  beforeEach(() => {
    eventBus = new EventBus();
    cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
  });

  it('should detect emerging distraction patterns', (done) => {
    const distractionPatternSpy = sinon.spy();
    eventBus.subscribe('NeuralPatternDisruptor', distractionPatternSpy);

    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    for (let i = 0; i < 6; i++) {
      eventBus.publish('focusChange', focusEvent);
    }

    setTimeout(() => {
      expect(distractionPatternSpy.calledOnce).to.be.true;
      expect(distractionPatternSpy.args[0][0]).to.deep.include({ eventType: 'NeuralPatternDisruptor' });
      done();
    }, 100);
  });

  it('should detect extended deep work sessions', (done) => {
    const deepWorkSessionSpy = sinon.spy();
    eventBus.subscribe('MicroBreak', deepWorkSessionSpy);

    const idleEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'IDLE'
    };

    for (let i = 0; i < 11; i++) {
      eventBus.publish('idleChange', idleEvent);
    }

    setTimeout(() => {
      expect(deepWorkSessionSpy.calledOnce).to.be.true;
      expect(deepWorkSessionSpy.args[0][0]).to.deep.include({ eventType: 'MicroBreak' });
      done();
    }, 100);
  });

  it('should track user compliance with micro-breaks', (done) => {
    const complianceTrackingSpy = sinon.spy();
    eventBus.subscribe('ComplianceTracking', complianceTrackingSpy);

    const microBreakEvent = {
      eventId: '1',
      eventType: 'MicroBreak',
      timestamp: new Date().toISOString(),
      metadata: { message: 'Extended deep work session detected' }
    };

    cognitiveEnhancementModule.trackCompliance(microBreakEvent);

    setTimeout(() => {
      expect(complianceTrackingSpy.calledOnce).to.be.true;
      expect(complianceTrackingSpy.args[0][0]).to.deep.include({ eventType: 'ComplianceTracking' });
      done();
    }, 100);
  });

  it('should adjust alert frequency and UI density based on cognitive load', (done) => {
    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    for (let i = 0; i < 11; i++) {
      eventBus.publish('focusChange', focusEvent);
    }

    cognitiveEnhancementModule.adjustCognitiveLoad();

    setTimeout(() => {
      expect(cognitiveEnhancementModule.alertFrequency).to.equal(0.5);
      expect(cognitiveEnhancementModule.uiDensity).to.equal(0.5);
      done();
    }, 100);
  });

  it('should use a ring buffer for distraction patterns', (done) => {
    const distractionPatternSpy = sinon.spy();
    eventBus.subscribe('NeuralPatternDisruptor', distractionPatternSpy);

    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    for (let i = 0; i < 101; i++) {
      eventBus.publish('focusChange', focusEvent);
    }

    setTimeout(() => {
      expect(cognitiveEnhancementModule.distractionPatterns.getItems().length).to.equal(100);
      done();
    }, 100);
  });

  it('should use a ring buffer for deep work sessions', (done) => {
    const deepWorkSessionSpy = sinon.spy();
    eventBus.subscribe('MicroBreak', deepWorkSessionSpy);

    const idleEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'IDLE'
    };

    for (let i = 0; i < 101; i++) {
      eventBus.publish('idleChange', idleEvent);
    }

    setTimeout(() => {
      expect(cognitiveEnhancementModule.deepWorkSessions.getItems().length).to.equal(100);
      done();
    }, 100);
  });

  it('should move heavy computations to idle periods using setTimeout', (done) => {
    const distractionPatternSpy = sinon.spy();
    eventBus.subscribe('NeuralPatternDisruptor', distractionPatternSpy);

    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    for (let i = 0; i < 6; i++) {
      eventBus.publish('focusChange', focusEvent);
    }

    setTimeout(() => {
      expect(distractionPatternSpy.calledOnce).to.be.true;
      expect(distractionPatternSpy.args[0][0]).to.deep.include({ eventType: 'NeuralPatternDisruptor' });
      done();
    }, 100);
  });

  it('should anonymize user IDs using hashed tokens', (done) => {
    const anonymizedUserID = cognitiveEnhancementModule.anonymizeUserID('testUserID');
    expect(anonymizedUserID).to.be.a('string');
    expect(anonymizedUserID).to.have.lengthOf(64); // SHA-256 hash length
    done();
  });

  it('should log sync failures', (done) => {
    const logSyncFailureSpy = sinon.spy(cognitiveEnhancementModule, 'logSyncFailure');
    const error = new Error('Test sync failure');
    cognitiveEnhancementModule.logSyncFailure(error);
    expect(logSyncFailureSpy.calledOnce).to.be.true;
    expect(logSyncFailureSpy.args[0][0]).to.deep.equal(error);
    done();
  });
});
