const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

class CognitiveEnhancementModule {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.breakInterval = 25 * 60 * 1000; // 25 minutes in milliseconds
    this.breakDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.breakTimer = null;
    this.behavioralEventsDAO = new BehavioralEventsDAO();

    this.eventBus.subscribe('update-goal-time', this.handleGoalFocusTimeUpdate.bind(this));
  }

  handleGoalFocusTimeUpdate(goalFocusTime) {
    if (goalFocusTime >= this.breakInterval) {
      this.scheduleBreak();
    }
  }

  scheduleBreak() {
    this.breakTimer = setTimeout(() => {
      this.publishBreakScheduledEvent();
    }, this.breakDuration);
  }

  publishBreakScheduledEvent() {
    const breakEvent = {
      eventType: 'BreakScheduled',
      timestamp: new Date(),
      metadata: {}
    };
    this.eventBus.publish('BreakScheduled', breakEvent);
  }

  trackCompliance(isCompliant) {
    const complianceEvent = {
      eventType: isCompliant ? 'BreakAccepted' : 'BreakDismissed',
      timestamp: new Date(),
      metadata: {}
    };
    this.eventBus.publish('BreakCompliance', complianceEvent);

    this.behavioralEventsDAO.insertRecord(complianceEvent.eventType, JSON.stringify(complianceEvent.metadata));
  }

  skipBreak() {
    const skippedBreakEvent = {
      eventType: 'SkippedBreak',
      timestamp: new Date(),
      metadata: {}
    };
    this.eventBus.publish('BreakCompliance', skippedBreakEvent);

    this.behavioralEventsDAO.insertRecord(skippedBreakEvent.eventType, JSON.stringify(skippedBreakEvent.metadata));
  }
}

module.exports = CognitiveEnhancementModule;
