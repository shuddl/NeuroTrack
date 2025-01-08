const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

class CognitiveEnhancementModule {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.goalFocusTime = 0;
    this.breakScheduled = false;
    this.complianceData = [];
    this.skippedBreaks = 0;

    this.eventBus.subscribe('focusChange', this.handleFocusChange.bind(this));
    this.eventBus.subscribe('idleChange', this.handleIdleChange.bind(this));
  }

  async initializeDatabase() {
    try {
      await BehavioralEventsDAO.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  handleFocusChange(data) {
    if (data.state === 'Work Focus') {
      this.startGoalFocusTimer();
    } else {
      this.pauseGoalFocusTimer();
    }
  }

  handleIdleChange(data) {
    this.pauseGoalFocusTimer();
  }

  startGoalFocusTimer() {
    if (!this.breakScheduled) {
      this.goalFocusTime = 0;
      this.breakScheduled = true;
      this.timerInterval = setInterval(() => {
        this.goalFocusTime += 1;
        if (this.goalFocusTime % 1500 === 0) { // 25 minutes
          this.scheduleBreak();
        }
      }, 1000);
    }
  }

  pauseGoalFocusTimer() {
    clearInterval(this.timerInterval);
    this.breakScheduled = false;
  }

  async scheduleBreak() {
    this.eventBus.publish('BreakScheduled', { goalFocusTime: this.goalFocusTime });
    try {
      await BehavioralEventsDAO.insertRecord('BreakScheduled', JSON.stringify({ goalFocusTime: this.goalFocusTime }));
    } catch (error) {
      console.error('Error inserting break scheduled event:', error);
    }
  }

  async trackCompliance(accepted) {
    this.complianceData.push({ timestamp: new Date(), accepted });
    try {
      await BehavioralEventsDAO.insertRecord('BreakCompliance', JSON.stringify({ accepted }));
    } catch (error) {
      console.error('Error inserting break compliance event:', error);
    }
    if (!accepted) {
      this.skippedBreaks += 1;
    }
  }
}

module.exports = CognitiveEnhancementModule;
