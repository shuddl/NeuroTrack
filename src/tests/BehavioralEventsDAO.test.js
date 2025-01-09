const { expect } = require('chai');
const db = require('../db/connection');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

describe('BehavioralEventsDAO', () => {
  beforeEach(async () => {
    await BehavioralEventsDAO.createTable();
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM behavioral_events', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('should add a new record', async () => {
    const eventType = 'focusChange';
    const metadata = JSON.stringify({ key: 'value' });

    const recordId = await BehavioralEventsDAO.insertRecord(eventType, metadata);

    const records = await BehavioralEventsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ event_type: eventType, metadata });
  });

  it('should query records', async () => {
    const eventType1 = 'focusChange';
    const metadata1 = JSON.stringify({ key: 'value1' });
    const eventType2 = 'contextSwitch';
    const metadata2 = JSON.stringify({ key: 'value2' });

    await BehavioralEventsDAO.insertRecord(eventType1, metadata1);
    await BehavioralEventsDAO.insertRecord(eventType2, metadata2);

    const records = await BehavioralEventsDAO.queryRecords();
    expect(records).to.have.lengthOf(2);
    expect(records[0]).to.include({ event_type: eventType2, metadata: metadata2 });
    expect(records[1]).to.include({ event_type: eventType1, metadata: metadata1 });
  });
});
