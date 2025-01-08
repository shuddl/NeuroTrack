const { expect } = require('chai');
const sqlite3 = require('sqlite3').verbose();
const FocusRecordsDAO = require('../FocusRecordsDAO');

describe('FocusRecordsDAO', () => {
  let dao;

  beforeEach(() => {
    dao = new FocusRecordsDAO();
  });

  it('should add a new record', (done) => {
    const record = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS',
      duration: 120
    };

    dao.addRecord(record);

    dao.queryRecords((err, rows) => {
      expect(err).to.be.null;
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.deep.include(record);
      done();
    });
  });

  it('should update an existing record', (done) => {
    const record = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS',
      duration: 120
    };

    dao.addRecord(record);

    const updatedRecord = {
      ...record,
      applicationName: 'UpdatedApp',
      duration: 150
    };

    dao.updateRecord(updatedRecord);

    dao.queryRecords((err, rows) => {
      expect(err).to.be.null;
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.deep.include(updatedRecord);
      done();
    });
  });

  it('should delete a record', (done) => {
    const record = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS',
      duration: 120
    };

    dao.addRecord(record);
    dao.deleteRecord(record.recordId);

    dao.queryRecords((err, rows) => {
      expect(err).to.be.null;
      expect(rows).to.have.lengthOf(0);
      done();
    });
  });

  it('should handle partial records when user switches states mid-tracking', (done) => {
    const record1 = {
      recordId: '1',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'FOCUS',
      duration: 60
    };

    const record2 = {
      recordId: '2',
      timestamp: new Date().toISOString(),
      applicationName: 'TestApp',
      userState: 'BREAK',
      duration: 30
    };

    dao.addRecord(record1);
    dao.addRecord(record2);

    dao.queryRecords((err, rows) => {
      expect(err).to.be.null;
      expect(rows).to.have.lengthOf(2);
      expect(rows[0]).to.deep.include(record1);
      expect(rows[1]).to.deep.include(record2);
      done();
    });
  });
});
