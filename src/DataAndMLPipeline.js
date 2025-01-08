const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

class RingBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Array(size);
    this.index = 0;
  }

  push(item) {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.size;
  }

  getItems() {
    return this.buffer.filter(item => item !== undefined);
  }
}

class DataAndMLPipeline {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.model = null;
    this.dataBuffer = new RingBuffer(100);
    this.loadModel();
    this.setupAPI();
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
    this.dataBuffer.push(data);

    setTimeout(async () => {
      const preprocessedData = this.preprocessData(data);
      const prediction = this.model.predict(preprocessedData);
      const distractionProbability = prediction.dataSync()[0];
      this.updateDistractionProbability(distractionProbability);
    }, 0);
  }

  updateDistractionProbability(distractionProbability) {
    // Update the "distractionProbability" field in the DB
    console.log(`Distraction Probability: ${distractionProbability}`);
    this.eventBus.publish('distractionProbabilityUpdated', { distractionProbability });
  }

  async getRealTimePrediction(data) {
    await this.performInference(data);
  }

  setupAPI() {
    const app = express();
    app.use(bodyParser.json());

    app.post('/pushData', (req, res) => {
      const data = req.body;
      const anonymizedData = this.anonymizeData(data);
      this.dataBuffer.push(anonymizedData);
      res.status(200).send('Data received');
    });

    app.get('/pullData', (req, res) => {
      const data = this.dataBuffer.getItems();
      res.status(200).json(data);
    });

    app.listen(3000, () => {
      console.log('API server running on port 3000');
    });
  }

  anonymizeData(data) {
    return {
      ...data,
      userId: crypto.createHash('sha256').update(data.userId).digest('hex')
    };
  }

  logSyncFailure(error) {
    console.error('Sync failure:', error);
  }
}

module.exports = DataAndMLPipeline;
