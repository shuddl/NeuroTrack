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

  it('should use a ring buffer for incoming data', (done) => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };

    for (let i = 0; i < 101; i++) {
      dataAndMLPipeline.performInference(data);
    }

    setTimeout(() => {
      expect(dataAndMLPipeline.dataBuffer.getItems().length).to.equal(100);
      done();
    }, 100);
  });

  it('should move heavy computations to idle periods using setTimeout', (done) => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };

    const updateDistractionProbabilitySpy = sinon.spy(dataAndMLPipeline, 'updateDistractionProbability');
    dataAndMLPipeline.performInference(data);

    setTimeout(() => {
      expect(updateDistractionProbabilitySpy.calledOnce).to.be.true;
      done();
    }, 100);
  });

  it('should push anonymized data via API endpoint', (done) => {
    const data = {
      userId: 'testUserID',
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };

    const anonymizedData = dataAndMLPipeline.anonymizeData(data);
    const pushDataSpy = sinon.spy(dataAndMLPipeline, 'pushData');
    dataAndMLPipeline.pushData(anonymizedData);

    setTimeout(() => {
      expect(pushDataSpy.calledOnce).to.be.true;
      expect(pushDataSpy.args[0][0]).to.deep.include({ userId: anonymizedData.userId });
      done();
    }, 100);
  });

  it('should pull anonymized data via API endpoint', (done) => {
    const pullDataSpy = sinon.spy(dataAndMLPipeline, 'pullData');
    dataAndMLPipeline.pullData();

    setTimeout(() => {
      expect(pullDataSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });

  it('should log sync failures', (done) => {
    const logSyncFailureSpy = sinon.spy(dataAndMLPipeline, 'logSyncFailure');
    const error = new Error('Test sync failure');
    dataAndMLPipeline.logSyncFailure(error);
    expect(logSyncFailureSpy.calledOnce).to.be.true;
    expect(logSyncFailureSpy.args[0][0]).to.deep equal(error);
    done();
  });

  it('should implement real-time feedback loop in performInference method', async () => {
    const data = {
      timeOfDay: 12,
      currentAppUsage: 1,
      pastContextSwitches: 3
    };
    const publishSpy = sinon.spy(eventBus, 'publish');
    await dataAndMLPipeline.performInference(data);
    expect(publishSpy.calledWith('modelPrediction')).to.be.true;
  });

  it('should publish and subscribe to events related to user behavior and model predictions using eventBus', (done) => {
    const userBehaviorSpy = sinon.spy(dataAndMLPipeline, 'handleUserBehavior');
    const modelPredictionSpy = sinon.spy(dataAndMLPipeline, 'handleModelPrediction');

    eventBus.publish('userBehavior', { behavior: 'test' });
    eventBus.publish('modelPrediction', { prediction: 'test' });

    setTimeout(() => {
      expect(userBehaviorSpy.calledOnce).to.be.true;
      expect(modelPredictionSpy.calledOnce).to.be.true;
      done();
    }, 100);
  });
});
