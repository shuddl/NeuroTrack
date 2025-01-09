const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const db = require('../db/connection');
const FocusRecordsDAO = require('../dao/FocusRecordsDAO');

describe('FocusRecordsDAO', () => {
  const testDBPath = path.resolve(__dirname, '../data/test_neurotrack.db');

  beforeEach(async () => {
    if (fs.existsSync(testDBPath)) {
      fs.unlinkSync(testDBPath);
    }
    await FocusRecordsDAO.createTable();
  });

  afterEach(async () => {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM focus_records', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  it('should add a new record', async () => {
    const application = 'TestApp';
    const state = 'FOCUS';

    const recordId = await FocusRecordsDAO.insertRecord(application, state);

    const records = await FocusRecordsDAO.queryRecords();
    expect(records).to.have.lengthOf(1);
    expect(records[0]).to.include({ application, state });
  });

  it('should query records', async () => {
    const application1 = 'TestApp1';
    const state1 = 'FOCUS';
    const application2 = 'TestApp2';
    const state2 = 'IDLE';

    await FocusRecordsDAO.insertRecord(application1, state1);
    await FocusRecordsDAO.insertRecord(application2, state2);

    const records = await FocusRecordsDAO.queryRecords();
    expect(records).to.have.lengthOf(2);
    expect(records[0]).to.include({ application: application2, state: state2 });
    expect(records[1]).to.include({ application: application1, state: state1 });
  });
});
