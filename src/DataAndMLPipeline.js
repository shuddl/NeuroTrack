const tf = require('@tensorflow/tfjs-node');

class DataAndMLPipeline {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.model = null;
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://path/to/model.json');
      console.log('Model loaded successfully');
    } catch (error) {
      console.log('No existing model found, creating a new one');
      this.model = tf.sequential();
      this.model.add(tf.layers.dense({ units: 1, inputShape: [3] }));
      this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
    }
  }

  async runInference(features) {
    if (!this.model) {
      console.error('Model not loaded');
      return;
    }

    const inputTensor = tf.tensor2d([features]);
    const prediction = this.model.predict(inputTensor);
    const distractionProbability = prediction.dataSync()[0];

    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
    console.log('Distraction probability updated:', distractionProbability);
  }

  async replaceModel(newModel) {
    this.model = newModel;
    console.log('Model replaced successfully');
  }

  async predictDistractionProbability(features) {
    if (!this.model) {
      console.error('Model not loaded');
      return;
    }

    const inputTensor = tf.tensor2d([features]);
    const prediction = this.model.predict(inputTensor);
    const distractionProbability = prediction.dataSync()[0];

    return distractionProbability;
  }

  async handleFocusEvent(features) {
    const distractionProbability = await this.predictDistractionProbability(features);
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
    console.log('Distraction probability updated:', distractionProbability);
  }

  async handleDailySession(features) {
    const distractionProbability = await this.predictDistractionProbability(features);
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
    console.log('Distraction probability updated:', distractionProbability);
  }

  async predictDistractionProbabilityFromFeatures(features) {
    const { timeOfDay, userIdleFrequency } = features;
    const inputFeatures = [timeOfDay, userIdleFrequency];
    return await this.predictDistractionProbability(inputFeatures);
  }

  async runInferenceAndUpdate(features) {
    const distractionProbability = await this.predictDistractionProbabilityFromFeatures(features);
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
    console.log('Distraction probability updated:', distractionProbability);
  }
}

module.exports = DataAndMLPipeline;
