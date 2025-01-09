const TimerRecordsDAO = require('../dao/TimerRecordsDAO');
const { ipcMain } = require('electron');

class TimerManager {
  constructor() {
    this.totalFocusTime = 0;
    this.goalFocusTime = 0;
    this.nonGoalFocusTime = 0;
    this.currentFocusType = null;
    this.timerInterval = null;
  }

  async initializeDatabase() {
    try {
      await TimerRecordsDAO.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  startFocusTimer(focusType) {
    if (this.currentFocusType !== focusType) {
      this.pauseFocusTimer();
      this.currentFocusType = focusType;
      this.timerInterval = setInterval(() => {
        this.totalFocusTime += 1;
        if (this.currentFocusType === 'goal') {
          this.goalFocusTime += 1;
        } else {
          this.nonGoalFocusTime += 1;
        }
        this.emitTimeUpdate();
      }, 1000);
    }
  }

  pauseFocusTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async storeDailyTotals(date) {
    try {
      await TimerRecordsDAO.insertRecord(date, this.goalFocusTime, this.nonGoalFocusTime);
    } catch (error) {
      console.error('Error storing daily totals:', error);
    }
  }

  emitTimeUpdate() {
    ipcMain.emit('update-time', {
      totalFocusTime: this.totalFocusTime,
      goalFocusTime: this.goalFocusTime,
      nonGoalFocusTime: this.nonGoalFocusTime
    });
  }
}

module.exports = TimerManager;
