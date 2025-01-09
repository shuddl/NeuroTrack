const tf = require('@tensorflow/tfjs-node');

class DataAndMLPipeline {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.model = null;
    this.loadModel();
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://path/to/model.json');
    } catch (error) {
      console.log('Error loading model, creating a new one.');
      this.model = this.createPlaceholderModel();
    }
  }

  createPlaceholderModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [3], activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
    return model;
  }

  preprocessData(data) {
    const { timeOfDay, currentAppUsage, pastContextSwitches } = data;
    return tf.tensor2d([[timeOfDay, currentAppUsage, pastContextSwitches]]);
  }

  async performInference(data) {
    const preprocessedData = this.preprocessData(data);
    const prediction = this.model.predict(preprocessedData);
    const distractionProbability = prediction.dataSync()[0];
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
  }

  async replaceOrRetrainModel(newData, newLabels) {
    const xs = tf.tensor2d(newData);
    const ys = tf.tensor2d(newLabels);
    await this.model.fit(xs, ys, { epochs: 10 });
    await this.model.save('file://path/to/model.json');
  }
}

module.exports = DataAndMLPipeline;
