const { EventEmitter } = require('eventemitter3');
const WindowsFocusTracker = require('./platforms/WindowsFocusTracker');
const MacOSFocusTracker = require('./platforms/MacOSFocusTracker');
const LinuxFocusTracker = require('./platforms/LinuxFocusTracker');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

    this.encryptionKey = this.loadOrGenerateKey();
    this.signKernelModules();
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
      const encryptedEventData = this.encryptData(eventData);
      this.eventBus.publish('focusChange', encryptedEventData);
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
        const encryptedEventData = this.encryptData(eventData);
        this.eventBus.publish('idleChange', encryptedEventData);
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

  encryptData(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, this.generateIV());
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  generateIV() {
    return crypto.randomBytes(16);
  }

  loadOrGenerateKey() {
    const keyPath = path.join(__dirname, 'encryptionKey');
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath);
    } else {
      const key = crypto.randomBytes(32);
      fs.writeFileSync(keyPath, key);
      return key;
    }
  }

  signKernelModules() {
    const kernelModules = ['module1.ko', 'module2.ko']; // Example kernel modules
    kernelModules.forEach(module => {
      const modulePath = path.join(__dirname, 'kernel_modules', module);
      const signature = crypto.createSign('SHA256');
      signature.update(fs.readFileSync(modulePath));
      const privateKey = fs.readFileSync(path.join(__dirname, 'private_key.pem'));
      const signedModule = signature.sign(privateKey, 'hex');
      fs.writeFileSync(`${modulePath}.sig`, signedModule);
    });
  }
}

module.exports = FocusTrackingEngine;
