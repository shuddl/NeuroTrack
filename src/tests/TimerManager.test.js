const { expect } = require('chai');
const TimerManager = require('../TimerManager');
const { ipcMain } = require('electron');

describe('TimerManager', () => {
  let timerManager;

  beforeEach(() => {
    timerManager = new TimerManager();
  });

  afterEach(() => {
    timerManager.pauseFocusTimer();
  });

  it('should reset timers at midnight', (done) => {
    timerManager.goalFocusTime = 100;
    timerManager.nonGoalFocusTime = 200;

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = nextMidnight - now;

    setTimeout(() => {
      expect(timerManager.goalFocusTime).to.equal(0);
      expect(timerManager.nonGoalFocusTime).to.equal(0);
      done();
    }, timeUntilMidnight + 1000);
  });

  it('should increment goalFocusTime and nonGoalFocusTime without overlap', (done) => {
    timerManager.startFocusTimer('goal');
    setTimeout(() => {
      timerManager.startFocusTimer('non-goal');
    }, 5000);

    setTimeout(() => {
      expect(timerManager.goalFocusTime).to.be.within(4, 6);
      expect(timerManager.nonGoalFocusTime).to.be.within(4, 6);
      done();
    }, 11000);
  });

  it('should always run the timer in one of the two modes', (done) => {
    timerManager.startFocusTimer('goal');
    setTimeout(() => {
      expect(timerManager.currentFocusType).to.equal('goal');
      timerManager.startFocusTimer('non-goal');
    }, 5000);

    setTimeout(() => {
      expect(timerManager.currentFocusType).to.equal('non-goal');
      done();
    }, 10000);
  });
});
