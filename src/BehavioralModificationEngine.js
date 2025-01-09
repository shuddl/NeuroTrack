const { EventEmitter } = require('eventemitter3');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class BehavioralModificationEngine extends EventEmitter {
  constructor(eventBus, timerManager) {
    super();
    this.eventBus = eventBus;
    this.timerManager = timerManager;
    this.focusIntervals = new RingBuffer(100);
    this.contextSwitches = new RingBuffer(100);
    this.sustainedFocusThreshold = 25 * 60; // 25 minutes in seconds
    this.contextSwitchThreshold = 5; // Example threshold for context switches
    this.behavioralEventsDAO = new BehavioralEventsDAO();

    this.eventBus.subscribe('focusChange', this.trackFocusEvent.bind(this));
    this.eventBus.subscribe('idleChange', this.trackContextSwitch.bind(this));
    this.timerManager.on('update-goal-time', this.checkGoalFocusTime.bind(this));
  }

  async trackFocusEvent(data) {
    const eventData = {
      eventId: uuidv4(),
      eventType: 'focusChange',
      timestamp: new Date(),
      metadata: data
    };
    this.focusIntervals.push(eventData);
    this.eventBus.publish('focusChange', eventData);

    try {
      await this.behavioralEventsDAO.insertRecord('focusChange', JSON.stringify(data));
    } catch (error) {
      console.error('Error inserting focus event:', error);
    }

    if (this.focusIntervals.getItems().length >= this.sustainedFocusThreshold) {
      this.triggerRewardEvent();
    }
  }

  async trackContextSwitch(data) {
    const eventData = {
      eventId: uuidv4(),
      eventType: 'contextSwitch',
      timestamp: new Date(),
      metadata: data
    };
    this.contextSwitches.push(eventData);
    this.eventBus.publish('contextSwitch', eventData);

    try {
      await this.behavioralEventsDAO.insertRecord('contextSwitch', JSON.stringify(data));
    } catch (error) {
      console.error('Error inserting context switch event:', error);
    }

    if (this.contextSwitches.getItems().length >= this.contextSwitchThreshold) {
      this.triggerProductivityDegradationEvent();
    }
  }

  async checkGoalFocusTime(goalFocusTime) {
    if (goalFocusTime >= this.sustainedFocusThreshold) {
      this.triggerRewardEvent();
    }
  }

  triggerRewardEvent() {
    const rewardEvent = {
      eventId: uuidv4(),
      eventType: 'RewardEvent',
      timestamp: new Date(),
      metadata: {}
    };
    this.eventBus.publish('RewardEvent', rewardEvent);

    try {
      this.behavioralEventsDAO.insertRecord('RewardEvent', JSON.stringify({}));
    } catch (error) {
      console.error('Error inserting reward event:', error);
    }

    // Display subtle UI prompt or color change in the always-on-top window
    this.eventBus.publish('displayRewardUI', {});
  }

  triggerProductivityDegradationEvent() {
    const degradationEvent = {
      eventId: uuidv4(),
      eventType: 'productivityDegradation',
      timestamp: new Date(),
      metadata: {}
    };
    this.eventBus.publish('productivityDegradation', degradationEvent);

    try {
      this.behavioralEventsDAO.insertRecord('productivityDegradation', JSON.stringify({}));
    } catch (error) {
      console.error('Error inserting productivity degradation event:', error);
    }
  }
}

class RingBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = [];
  }

  push(item) {
    if (this.buffer.length >= this.size) {
      this.buffer.shift();
    }
    this.buffer.push(item);
  }

  getItems() {
    return this.buffer;
  }
}

module.exports = BehavioralModificationEngine;
