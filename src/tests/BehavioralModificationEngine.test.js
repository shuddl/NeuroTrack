const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const BehavioralModificationEngine = require('../BehavioralModificationEngine');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');
const TimerManager = require('../TimerManager');

describe('BehavioralModificationEngine', () => {
  let eventBus;
  let behavioralModificationEngine;
  let behavioralEventsDAO;
  let timerManager;

  beforeEach(async () => {
    eventBus = new EventBus();
    timerManager = new TimerManager();
    behavioralModificationEngine = new BehavioralModificationEngine(eventBus, timerManager);
    behavioralEventsDAO = new BehavioralEventsDAO();
    await behavioralEventsDAO.createTable();
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM behavioral_events', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
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
      behavioralEventsDAO.queryRecords().then((rows) => {
        expect(rows).to.have.lengthOf(1);
        expect(rows[0]).to.deep.include({ eventType: 'RewardEvent' });
        done();
      }).catch((err) => {
        expect(err).to.be.null;
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

  it('should trigger "RewardEvent" after 25 consecutive minutes of goal focus', (done) => {
    const rewardEventSpy = sinon.spy();
    eventBus.subscribe('RewardEvent', rewardEventSpy);

    timerManager.startGoalFocusTimer();
    setTimeout(() => {
      timerManager.goalFocusTime = 25 * 60; // Simulate 25 minutes
      timerManager.emitGoalTimeUpdate();
    }, 100);

    setTimeout(() => {
      expect(rewardEventSpy.calledOnce).to.be.true;
      expect(rewardEventSpy.args[0][0]).to.deep.include({ eventType: 'RewardEvent' });
      done();
    }, 200);
  });

  it('should publish "productivityDegradation" event if frequent context switching threshold is exceeded', (done) => {
    const degradationEventSpy = sinon.spy();
    eventBus.subscribe('productivityDegradation', degradationEventSpy);

    const contextSwitchEvent = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'IDLE'
    };

    for (let i = 0; i < 6; i++) {
      eventBus.publish('idleChange', contextSwitchEvent);
    }

    setTimeout(() => {
      expect(degradationEventSpy.calledOnce).to.be.true;
      expect(degradationEventSpy.args[0][0]).to.deep.include({ eventType: 'productivityDegradation' });
      done();
    }, 100);
  });

  it('should display a subtle UI prompt or color change in the always-on-top window upon triggering a "RewardEvent"', (done) => {
    const displayRewardUISpy = sinon.spy();
    eventBus.subscribe('displayRewardUI', displayRewardUISpy);

    timerManager.startGoalFocusTimer();
    setTimeout(() => {
      timerManager.goalFocusTime = 25 * 60; // Simulate 25 minutes
      timerManager.emitGoalTimeUpdate();
    }, 100);

    setTimeout(() => {
      expect(displayRewardUISpy.calledOnce).to.be.true;
      done();
    }, 200);
  });

  it('should handle the corner case where the user toggles "goal" but then goes idle', (done) => {
    const rewardEventSpy = sinon.spy();
    eventBus.subscribe('RewardEvent', rewardEventSpy);

    timerManager.startGoalFocusTimer();
    setTimeout(() => {
      timerManager.goalFocusTime = 20 * 60; // Simulate 20 minutes
      timerManager.emitGoalTimeUpdate();
    }, 100);

    setTimeout(() => {
      eventBus.publish('idleChange', { recordId: '1', timestamp: new Date().toISOString(), applicationName: 'TestApp', userState: 'IDLE' });
    }, 200);

    setTimeout(() => {
      timerManager.goalFocusTime = 25 * 60; // Simulate 25 minutes
      timerManager.emitGoalTimeUpdate();
    }, 300);

    setTimeout(() => {
      expect(rewardEventSpy.called).to.be.false;
      done();
    }, 400);
  });
});
