const { EventEmitter } = require('eventemitter3');
const { exec } = require('child_process');

class WindowsFocusTracker extends EventEmitter {
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
    exec('powershell "Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object MainWindowTitle"', (err, stdout) => {
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
    exec('powershell "(Get-IdleTime).TotalMilliseconds"', (err, stdout) => {
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

module.exports = WindowsFocusTracker;
