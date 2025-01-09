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
    updateTime: (callback) => {
        ipcRenderer.on('update-time', (event, time) => callback(time));
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const goalButton = document.getElementById('goal-button');
    const nonGoalButton = document.getElementById('non-goal-button');

    goalButton.addEventListener('click', () => {
        ipcRenderer.send('start-goal-timer');
    });

    nonGoalButton.addEventListener('click', () => {
        ipcRenderer.send('start-non-goal-timer');
    });

    ipcRenderer.on('update-time', (event, time) => {
        const timeElement = document.getElementById('time');
        timeElement.textContent = new Date(time * 1000).toISOString().substr(11, 8);
    });
});
