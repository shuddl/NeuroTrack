const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

class DataAndMLPipeline {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.model = null;
    this.loadModel();
  }

  async loadModel() {
    const modelPath = path.join(__dirname, 'model', 'distraction_model.json');
    this.model = await tf.loadLayersModel(`file://${modelPath}`);
  }

  preprocessData(data) {
    const { timeOfDay, currentAppUsage, pastContextSwitches } = data;
    return tf.tensor2d([[timeOfDay, currentAppUsage, pastContextSwitches]]);
  }

  async performInference(data) {
    const preprocessedData = this.preprocessData(data);
    const prediction = this.model.predict(preprocessedData);
    const distractionProbability = prediction.dataSync()[0];
    this.updateDistractionProbability(distractionProbability);
  }

  updateDistractionProbability(distractionProbability) {
    // Update the "distractionProbability" field in the DB
    console.log(`Distraction Probability: ${distractionProbability}`);
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
  }

  async getRealTimePrediction(data) {
    await this.performInference(data);
  }
}

module.exports = DataAndMLPipeline;
