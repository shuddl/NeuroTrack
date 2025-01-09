const { expect } = require('chai');
const sinon = require('sinon');
const EventBus = require('../eventBus');
const CognitiveEnhancementModule = require('../CognitiveEnhancementModule');


describe('CognitiveEnhancementModule', () => {
  let eventBus;
  let cognitiveEnhancementModule;

  beforeEach(() => {
    eventBus = new EventBus();
    cognitiveEnhancementModule = new CognitiveEnhancementModule(eventBus);
  });


  });
});
