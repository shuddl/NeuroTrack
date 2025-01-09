const tf = require('@tensorflow/tfjs-node');


class DataAndMLPipeline {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.model = null;

  }
}

module.exports = DataAndMLPipeline;
