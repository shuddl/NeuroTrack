const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const FocusTrackingEngine = require('../FocusTrackingEngine');
const FocusRecordsDAO = require('../dao/FocusRecordsDAO');
const db = require('../db/connection');

describe('FocusTrackingEngine', () => {
  let eventBus;
  let focusTrackingEngine;

  beforeEach(async () => {
    eventBus = new EventBus();
    focusTrackingEngine = new FocusTrackingEngine(eventBus);
    await FocusRecordsDAO.createTable();
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM focus_records', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('should detect application switch', (done) => {
    const focusChangeSpy = sinon.spy();
    eventBus.subscribe('focusChange', focusChangeSpy);

    // Simulate focus change
    focusTrackingEngine.handleFocusChange({ activeWindow: 'NewApp' });

    setTimeout(() => {
      expect(focusChangeSpy.calledOnce).to.be.true;
      expect(focusChangeSpy.args[0][0]).to.deep.include({ state: 'Work Focus', activeWindow: 'NewApp' });
      done();
    }, 100);
  });

  it('should transition to idle/break state after inactivity threshold', (done) => {
    const idleChangeSpy = sinon.spy();
    eventBus.subscribe('idleChange', idleChangeSpy);

    // Simulate inactivity
    focusTrackingEngine.lastActivityTime = Date.now() - focusTrackingEngine.idleThreshold - 1000;

    setTimeout(() => {
      expect(idleChangeSpy.calledOnce).to.be.true;
      expect(idleChangeSpy.args[0][0]).to.deep.include({ state: 'Break/Leisure' });
      done();
    }, 2000);
  });

  it('should use setTimeout for idle checking', (done) => {
    const idleCheckSpy = sinon.spy(focusTrackingEngine, 'startIdleCheck');
    focusTrackingEngine.startIdleCheck();

    setTimeout(() => {
      expect(idleCheckSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });

  it('should stop idle check when application is closed', (done) => {
    const stopIdleCheckSpy = sinon.spy(focusTrackingEngine, 'stopIdleCheck');
    focusTrackingEngine.stopIdleCheck();

    setTimeout(() => {
      expect(stopIdleCheckSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });

  it('should persist focus change events to the database', async () => {
    const application = 'TestApp';
    const state = 'Work Focus';

    await focusTrackingEngine.handleFocusChange({ activeWindow: application });

    const records = await FocusRecordsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ application, state });
  });

  it('should persist idle change events to the database', async () => {
    const application = 'TestApp';
    const state = 'Break/Leisure';

    await focusTrackingEngine.handleIdleChange({ activeWindow: application });

    const records = await FocusRecordsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ application, state });
  });

  it('should track context switches between applications using trackContextSwitch method', (done) => {
    const contextSwitchSpy = sinon.spy();
    eventBus.subscribe('contextSwitch', contextSwitchSpy);

    // Simulate context switch
    focusTrackingEngine.handleFocusChange({ activeWindow: 'App1' });
    focusTrackingEngine.handleFocusChange({ activeWindow: 'App2' });

    setTimeout(() => {
      expect(contextSwitchSpy.calledTwice).to.be.true;
      expect(contextSwitchSpy.args[0][0]).to.deep.include({ state: 'Work Focus', activeWindow: 'App1' });
      expect(contextSwitchSpy.args[1][0]).to.deep.include({ state: 'Work Focus', activeWindow: 'App2' });
      done();
    }, 100);
  });

  it('should monitor idle time using checkIdleTime method in platform-specific focus trackers', (done) => {
    const idleChangeSpy = sinon.spy();
    eventBus.subscribe('idleChange', idleChangeSpy);

    // Simulate idle time
    focusTrackingEngine.lastActivityTime = Date.now() - focusTrackingEngine.idleThreshold - 1000;
    focusTrackingEngine.checkIdleTime();

    setTimeout(() => {
      expect(idleChangeSpy.calledOnce).to.be.true;
      expect(idleChangeSpy.args[0][0]).to.deep.include({ state: 'Break/Leisure' });
      done();
    }, 100);
  });
});
