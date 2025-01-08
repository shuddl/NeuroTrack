const { EventEmitter } = require('eventemitter3');
const WindowsFocusTracker = require('./platforms/WindowsFocusTracker');
const MacOSFocusTracker = require('./platforms/MacOSFocusTracker');
const LinuxFocusTracker = require('./platforms/LinuxFocusTracker');
const { v4: uuidv4 } = require('uuid');

class FocusTrackingEngine extends EventEmitter {
  constructor(eventBus) {
    super();
    this.eventBus = eventBus;
    this.currentState = 'Work Focus';
    this.idleThreshold = 300000; // 5 minutes
    this.lastActivityTime = Date.now();
    this.idleCheckTimeout = null;

    this.platformTracker = this.getPlatformTracker();
    this.platformTracker.on('focusChange', this.handleFocusChange.bind(this));
    this.platformTracker.on('idleChange', this.handleIdleChange.bind(this));

    this.startIdleCheck();
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

  handleFocusChange(data) {
    this.lastActivityTime = Date.now();
    if (this.currentState !== 'Work Focus') {
      this.currentState = 'Work Focus';
      const eventData = {
        recordId: uuidv4(),
        timestamp: new Date(),
        applicationName: data.activeWindow,
        userState: this.currentState
      };
      this.eventBus.publish('focusChange', eventData);
    }
  }

  handleIdleChange(data) {
    if (Date.now() - this.lastActivityTime > this.idleThreshold) {
      if (this.currentState !== 'Break/Leisure') {
        this.currentState = 'Break/Leisure';
        const eventData = {
          recordId: uuidv4(),
          timestamp: new Date(),
          applicationName: data.activeWindow || 'Unknown',
          userState: this.currentState
        };
        this.eventBus.publish('idleChange', eventData);
      }
    }
  }

  startIdleCheck() {
    const checkIdle = () => {
      if (Date.now() - this.lastActivityTime > this.idleThreshold) {
        this.handleIdleChange({});
      }
      this.idleCheckTimeout = setTimeout(checkIdle, 1000);
    };
    this.idleCheckTimeout = setTimeout(checkIdle, 1000);
  }

  stopIdleCheck() {
    if (this.idleCheckTimeout) {
      clearTimeout(this.idleCheckTimeout);
      this.idleCheckTimeout = null;
    }
  }
}

module.exports = FocusTrackingEngine;
