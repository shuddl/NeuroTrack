const TimerRecordsDAO = require('../dao/TimerRecordsDAO');
const { ipcMain } = require('electron');

class TimerManager {
  constructor() {
    this.goalFocusTime = 0;
    this.nonGoalFocusTime = 0;
    this.currentTimer = null;
    this.timerInterval = null;
  }

  async initializeDatabase() {
    try {
      await TimerRecordsDAO.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  startGoalFocusTimer() {
    if (this.currentTimer !== 'goal') {
      this.pauseNonGoalFocusTimer();
      this.currentTimer = 'goal';
      this.timerInterval = setInterval(() => {
        this.goalFocusTime += 1;
        this.emitGoalTimeUpdate();
      }, 1000);
      ipcMain.emit('update-goal-time', this.goalFocusTime); // P39b5
    }
  }

  pauseGoalFocusTimer() {
    if (this.currentTimer === 'goal') {
      clearInterval(this.timerInterval);
      this.currentTimer = null;
    }
  }

  startNonGoalFocusTimer() {
    if (this.currentTimer !== 'non-goal') {
      this.pauseGoalFocusTimer();
      this.currentTimer = 'non-goal';
      this.timerInterval = setInterval(() => {
        this.nonGoalFocusTime += 1;
        this.emitNonGoalTimeUpdate();
      }, 1000);
      ipcMain.emit('update-non-goal-time', this.nonGoalFocusTime); // P39b5
    }
  }

  pauseNonGoalFocusTimer() {
    if (this.currentTimer === 'non-goal') {
      clearInterval(this.timerInterval);
      this.currentTimer = null;
    }
  }

  async storeDailyTotals(date) {
    try {
      await TimerRecordsDAO.insertRecord(date, this.goalFocusTime, this.nonGoalFocusTime);
    } catch (error) {
      console.error('Error storing daily totals:', error);
    }
  }

  emitGoalTimeUpdate() {
    ipcMain.emit('update-goal-time', this.goalFocusTime);
  }

  emitNonGoalTimeUpdate() {
    ipcMain.emit('update-non-goal-time', this.nonGoalFocusTime);
  }
}

module.exports = TimerManager;
