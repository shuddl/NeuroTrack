const { EventEmitter } = require('eventemitter3');
const { exec } = require('child_process');

class MacOSFocusTracker extends EventEmitter {
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
    exec('osascript -e \'tell application "System Events" to get name of (processes where frontmost is true)\'', (err, stdout) => {
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
    exec('ioreg -c IOHIDSystem | awk \'/HIDIdleTime/ {print $NF/1000000000; exit}\'', (err, stdout) => {
      if (err) {
        console.error('Error fetching idle time:', err);
        return;
      }

      const idleTime = parseFloat(stdout.trim()) * 1000;
      if (idleTime > this.idleThreshold) {
        this.emit('idleChange', { idleTime });
      }
    });
  }
}

module.exports = MacOSFocusTracker;
