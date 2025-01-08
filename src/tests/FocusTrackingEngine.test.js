const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const FocusTrackingEngine = require('../FocusTrackingEngine');

describe('FocusTrackingEngine', () => {
  let eventBus;
  let focusTrackingEngine;

  beforeEach(() => {
    eventBus = new EventBus();
    focusTrackingEngine = new FocusTrackingEngine(eventBus);
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
});
