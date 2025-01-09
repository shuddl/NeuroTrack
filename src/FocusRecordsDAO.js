const sqlite3 = require('sqlite3').verbose();

class FocusRecordsDAO {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.createTable();
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS FocusRecords (
        recordId TEXT PRIMARY KEY,
        timestamp TEXT,
        applicationName TEXT,
        userState TEXT,
        duration INTEGER
      )
    `;
    this.db.run(sql);
  }

  addRecord(record) {
    const sql = `
      INSERT INTO FocusRecords (recordId, timestamp, applicationName, userState, duration)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [record.recordId, record.timestamp, record.applicationName, record.userState, record.duration];
    this.db.run(sql, params, function (err) {
      if (err) {
        console.error('Error adding record:', err);
      }
    });
  }

  updateRecord(record) {
    const sql = `
      UPDATE FocusRecords
      SET timestamp = ?, applicationName = ?, userState = ?, duration = ?
      WHERE recordId = ?
    `;
    const params = [record.timestamp, record.applicationName, record.userState, record.duration, record.recordId];
    this.db.run(sql, params, function (err) {
      if (err) {
        console.error('Error updating record:', err);
      }
    });
  }

  deleteRecord(recordId) {
    const sql = `
      DELETE FROM FocusRecords
      WHERE recordId = ?
    `;
    this.db.run(sql, recordId, function (err) {
      if (err) {
        console.error('Error deleting record:', err);
      }
    });
  }

  queryRecords(callback) {
    const sql = `
      SELECT * FROM FocusRecords
    `;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error querying records:', err);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = FocusRecordsDAO;
