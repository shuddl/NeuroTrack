const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const DataAndMLPipeline = require('../DataAndMLPipeline');

describe('DataAndMLPipeline', () => {
  let eventBus;
  let dataAndMLPipeline;

  beforeEach(() => {
    eventBus = new EventBus();
    dataAndMLPipeline = new DataAndMLPipeline(eventBus);
  });

  it('should load a sample model that predicts "distraction probability"', async () => {
    await dataAndMLPipeline.loadModel();
    expect(dataAndMLPipeline.model).to.not.be.null;
  });

  it('should preprocess data for the model', () => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };
    const preprocessedData = dataAndMLPipeline.preprocessData(data);
    expect(preprocessedData.shape).to.deep.equal([1, 3]);
  });

  it('should perform inference and update the "distractionProbability" field in the DB', async () => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };
    const updateDistractionProbabilitySpy = sinon.spy(dataAndMLPipeline, 'updateDistractionProbability');
    await dataAndMLPipeline.performInference(data);
    expect(updateDistractionProbabilitySpy.calledOnce).to.be.true;
  });

  it('should expose an endpoint or function for real-time predictions', async () => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };
    const prediction = await dataAndMLPipeline.getRealTimePrediction(data);
    expect(prediction).to.not.be.null;
  });
});
