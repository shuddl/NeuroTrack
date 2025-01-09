const db = require('../db/connection');

class FocusRecordsDAO {
  static createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS focus_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        application TEXT,
        state TEXT
      )
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static insertRecord(application, state) {
    const sql = `
      INSERT INTO focus_records (application, state)
      VALUES (?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, [application, state], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static queryRecords() {
    const sql = `
      SELECT * FROM focus_records
      ORDER BY timestamp DESC
    `;
    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = FocusRecordsDAO;
