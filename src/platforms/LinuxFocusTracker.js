const { EventEmitter } = require('eventemitter3');
const { exec } = require('child_process');

class LinuxFocusTracker extends EventEmitter {
  constructor() {
    super();
    this.currentWindow = null;
    this.idleTime = 0;
    this.idleThreshold = 300000; // 5 minutes

    this.startTracking();
  }

  startTracking() {
    setInterval(() => {
      this.checkActiveWindow();
      this.checkIdleTime();
    }, 1000);
  }

  checkActiveWindow() {
    exec('xdotool getwindowfocus getwindowname', (err, stdout) => {
      if (err) {
        console.error('Error fetching active window:', err);
        return;
      }

      const activeWindow = stdout.trim();
      if (activeWindow && activeWindow !== this.currentWindow) {
        this.currentWindow = activeWindow;
        this.emit('focusChange', { activeWindow });
      }
    });
  }

  checkIdleTime() {
    exec('xprintidle', (err, stdout) => {
      if (err) {
        console.error('Error fetching idle time:', err);
        return;
      }

      const idleTime = parseInt(stdout.trim(), 10);
      if (idleTime > this.idleThreshold) {
        this.emit('idleChange', { idleTime });
      }
    });
  }
}

module.exports = LinuxFocusTracker;
