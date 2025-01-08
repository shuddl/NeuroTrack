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

window.addEventListener('DOMContentLoaded', () => {
    const goalButton = document.getElementById('goal-button');
    const nonGoalButton = document.getElementById('non-goal-button');

    goalButton.addEventListener('click', () => {
        ipcRenderer.send('start-goal-timer');
    });

    nonGoalButton.addEventListener('click', () => {
        ipcRenderer.send('start-non-goal-timer');
    });

    ipcRenderer.on('update-goal-time', (event, time) => {
        const goalTimeElement = document.getElementById('goal-time');
        goalTimeElement.textContent = new Date(time * 1000).toISOString().substr(11, 8);
    });

    ipcRenderer.on('update-non-goal-time', (event, time) => {
        const nonGoalTimeElement = document.getElementById('non-goal-time');
        nonGoalTimeElement.textContent = new Date(time * 1000).toISOString().substr(11, 8);
    });
});
