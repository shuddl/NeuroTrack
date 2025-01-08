const { EventEmitter } = require('eventemitter3');
const WindowsFocusTracker = require('./platforms/WindowsFocusTracker');
const MacOSFocusTracker = require('./platforms/MacOSFocusTracker');
const LinuxFocusTracker = require('./platforms/LinuxFocusTracker');
const FocusRecordsDAO = require('../dao/FocusRecordsDAO');

class FocusTrackingEngine extends EventEmitter {
  constructor(eventBus) {
    super();
    this.eventBus = eventBus;
    this.currentState = 'Work Focus';
    this.idleThreshold = 300000; // 5 minutes
    this.lastActivityTime = Date.now();

    this.platformTracker = this.getPlatformTracker();
    this.platformTracker.on('focusChange', this.handleFocusChange.bind(this));
    this.platformTracker.on('idleChange', this.handleIdleChange.bind(this));

    this.startIdleCheck();
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      await FocusRecordsDAO.createTable();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  getPlatformTracker() {
    switch (process.platform) {
      case 'win32':
        return new WindowsFocusTracker();
      case 'darwin':
        return new MacOSFocusTracker();
      case 'linux':
        return new LinuxFocusTracker();
      default:
        throw new Error('Unsupported platform');
    }
  }

  async handleFocusChange(data) {
    this.lastActivityTime = Date.now();
    if (this.currentState !== 'Work Focus') {
      this.currentState = 'Work Focus';
      this.eventBus.publish('focusChange', { state: this.currentState, ...data });
    }
    try {
      await FocusRecordsDAO.insertRecord(data.activeWindow, this.currentState);
    } catch (error) {
      console.error('Error inserting focus record:', error);
    }
  }

  async handleIdleChange(data) {
    if (Date.now() - this.lastActivityTime > this.idleThreshold) {
      if (this.currentState !== 'Break/Leisure') {
        this.currentState = 'Break/Leisure';
        this.eventBus.publish('idleChange', { state: this.currentState, ...data });
      }
      try {
        await FocusRecordsDAO.insertRecord(data.activeWindow, this.currentState);
      } catch (error) {
        console.error('Error inserting idle record:', error);
      }
    }
  }

  startIdleCheck() {
    setInterval(() => {
      if (Date.now() - this.lastActivityTime > this.idleThreshold) {
        this.handleIdleChange({});
      }
    }, 1000);
  }
}

module.exports = FocusTrackingEngine;
