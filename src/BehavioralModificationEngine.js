const BehavioralEventsDAO = require('./BehavioralEventsDAO');
const crypto = require('crypto');

class RingBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.index = 0;
  }

  push(item) {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.size;
  }

  getItems() {
    return this.buffer.filter(item => item !== undefined);
  }
}

class BehavioralModificationEngine {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.focusIntervals = new RingBuffer(100);
    this.contextSwitches = new RingBuffer(100);
    this.sustainedFocusThreshold = 25 * 60 * 1000; // 25 minutes
    this.contextSwitchThreshold = 5 * 60 * 1000; // 5 minutes
    this.behavioralEventsDAO = new BehavioralEventsDAO();

    this.eventBus.subscribe('focusChange', this.trackFocusEvent.bind(this));
    this.eventBus.subscribe('idleChange', this.trackFocusEvent.bind(this));
  }

  trackFocusEvent(data) {
    const now = Date.now();
    this.focusIntervals.push({ timestamp: now, data });

    // Check for sustained focus
    setTimeout(() => this.checkSustainedFocus(now), 0);

    // Check for frequent context switching
    setTimeout(() => this.checkContextSwitching(now), 0);
  }

  checkSustainedFocus(now) {
    const sustainedFocusIntervals = this.focusIntervals.getItems().filter(
      interval => now - interval.timestamp <= this.sustainedFocusThreshold
    );

    if (sustainedFocusIntervals.length >= this.sustainedFocusThreshold / (5 * 60 * 1000)) {
      const rewardEvent = {
        eventId: this.generateUUID(),
        eventType: 'RewardEvent',
        timestamp: new Date().toISOString(),
        metadata: { message: 'Sustained focus achieved' }
      };
      this.eventBus.publish('RewardEvent', rewardEvent);
      this.behavioralEventsDAO.addEvent(rewardEvent);
    }
  }

  checkContextSwitching(now) {
    const recentContextSwitches = this.contextSwitches.getItems().filter(
      switchEvent => now - switchEvent.timestamp <= this.contextSwitchThreshold
    );

    if (recentContextSwitches.length > 3) {
      const degradationEvent = {
        eventId: this.generateUUID(),
        eventType: 'productivityDegradation',
        timestamp: new Date().toISOString(),
        metadata: { message: 'Frequent context switching detected' }
      };
      this.eventBus.publish('productivityDegradation', degradationEvent);
      this.behavioralEventsDAO.addEvent(degradationEvent);
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  anonymizeUserID(userID) {
    return crypto.createHash('sha256').update(userID).digest('hex');
  }

  logSyncFailure(error) {
    console.error('Sync failure:', error);
  }
}

module.exports = BehavioralModificationEngine;
