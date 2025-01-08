const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});

contextBridge.exposeInMainWorld('timers', {
    updateGoalTime: (callback) => {
        ipcRenderer.on('update-goal-time', (event, time) => callback(time));
    },
    updateNonGoalTime: (callback) => {
        ipcRenderer.on('update-non-goal-time', (event, time) => callback(time));
    }
});
