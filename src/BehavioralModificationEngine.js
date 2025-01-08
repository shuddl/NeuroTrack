const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

class BehavioralModificationEngine {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.goalFocusTime = 0;
    this.nonGoalFocusTime = 0;
    this.currentTimer = null;
    this.timerInterval = null;

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
    if (this.currentTimer !== 'goal') {
      this.pauseNonGoalFocusTimer();
      this.currentTimer = 'goal';
      this.timerInterval = setInterval(() => {
        this.goalFocusTime += 1;
        if (this.goalFocusTime % 1500 === 0) { // 25 minutes
          this.triggerRewardEvent();
        }
      }, 1000);
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
      }, 1000);
    }
  }

  pauseNonGoalFocusTimer() {
    if (this.currentTimer === 'non-goal') {
      clearInterval(this.timerInterval);
      this.currentTimer = null;
    }
  }

  async triggerRewardEvent() {
    try {
      await BehavioralEventsDAO.insertRecord('RewardEvent', JSON.stringify({ goalFocusTime: this.goalFocusTime }));
      this.eventBus.publish('RewardEvent', { goalFocusTime: this.goalFocusTime });
    } catch (error) {
      console.error('Error inserting reward event:', error);
    }
  }
}

module.exports = BehavioralModificationEngine;
