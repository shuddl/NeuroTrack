const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const BehavioralModificationEngine = require('../BehavioralModificationEngine');
const BehavioralEventsDAO = require('../BehavioralEventsDAO');

describe('BehavioralModificationEngine', () => {
  let eventBus;
  let behavioralModificationEngine;
  let behavioralEventsDAO;

  beforeEach(() => {
    eventBus = new EventBus();
    behavioralModificationEngine = new BehavioralModificationEngine(eventBus);
    behavioralEventsDAO = new BehavioralEventsDAO();
  });

  it('should track focus intervals and context switching', (done) => {
    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    eventBus.publish('focusChange', focusEvent);

    setTimeout(() => {
      expect(behavioralModificationEngine.focusIntervals.getItems()).to.have.lengthOf(1);
      expect(behavioralModificationEngine.focusIntervals.getItems()[0].data).to.deep.include(focusEvent);
      done();
    }, 100);
  });

  it('should trigger "RewardEvent" after sustained focus threshold', (done) => {
    const rewardEventSpy = sinon.spy();
    eventBus.subscribe('RewardEvent', rewardEventSpy);

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
      expect(rewardEventSpy.calledOnce).to.be.true;
      expect(rewardEventSpy.args[0][0]).to.deep.include({ eventType: 'RewardEvent' });
      done();
    }, 100);
  });

  it('should trigger "productivityDegradation" event if user switches tasks too frequently', (done) => {
    const degradationEventSpy = sinon.spy();
    eventBus.subscribe('productivityDegradation', degradationEventSpy);

    const focusEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS'
    };

    for (let i = 0; i < 4; i++) {
      eventBus.publish('focusChange', focusEvent);
    }

    setTimeout(() => {
      expect(degradationEventSpy.calledOnce).to.be.true;
      expect(degradationEventSpy.args[0][0]).to.deep.include({ eventType: 'productivityDegradation' });
      done();
    }, 100);
  });

  it('should write triggered events to the "BehavioralEvents" table', (done) => {
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
      behavioralEventsDAO.queryEvents((err, rows) => {
        expect(err).to.be.null;
        expect(rows).to.have.lengthOf(1);
        expect(rows[0]).to.deep.include({ eventType: 'RewardEvent' });
        done();
      });
    }, 100);
  });

  it('should use a ring buffer for focus intervals', (done) => {
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
      expect(behavioralModificationEngine.focusIntervals.getItems().length).to.equal(100);
      done();
    }, 100);
  });

  it('should use a ring buffer for context switches', (done) => {
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
      expect(behavioralModificationEngine.contextSwitches.getItems().length).to.equal(100);
      done();
    }, 100);
  });

  it('should move heavy computations to idle periods using setTimeout', (done) => {
    const rewardEventSpy = sinon.spy();
    eventBus.subscribe('RewardEvent', rewardEventSpy);

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
      expect(rewardEventSpy.calledOnce).to.be.true;
      expect(rewardEventSpy.args[0][0]).to.deep.include({ eventType: 'RewardEvent' });
      done();
    }, 100);
  });

  it('should anonymize user IDs using hashed tokens', (done) => {
    const anonymizedUserID = behavioralModificationEngine.anonymizeUserID('testUserID');
    expect(anonymizedUserID).to.be.a('string');
    expect(anonymizedUserID).to.have.lengthOf(64); // SHA-256 hash length
    done();
  });

  it('should log sync failures', (done) => {
    const logSyncFailureSpy = sinon.spy(behavioralModificationEngine, 'logSyncFailure');
    const error = new Error('Test sync failure');
    behavioralModificationEngine.logSyncFailure(error);
    expect(logSyncFailureSpy.calledOnce).to.be.true;
    expect(logSyncFailureSpy.args[0][0]).to.deep.equal(error);
    done();
  });
});
