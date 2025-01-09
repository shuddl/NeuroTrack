
      width: 300,
      height: 200,
      alwaysOnTop: true,
  }
}

module.exports = AlwaysOnTopUI;

app.on('ready', () => {
  const eventBus = new (require('./eventBus'))();
  new AlwaysOnTopUI(eventBus);
});
