const db = require('../db/connection');

class BehavioralEventsDAO {
  static createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS behavioral_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT,
        metadata TEXT
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

  static insertRecord(eventType, metadata) {
    const sql = `
      INSERT INTO behavioral_events (event_type, metadata)
      VALUES (?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, [eventType, metadata], function (err) {
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
      SELECT * FROM behavioral_events
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

module.exports = BehavioralEventsDAO;
