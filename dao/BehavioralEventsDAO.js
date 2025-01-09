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

  static queryContextSwitchEvents() {
    const sql = `
      SELECT * FROM behavioral_events
      WHERE event_type = 'contextSwitch'
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

  static analyzeContextSwitchFrequencyAndDuration() {
    return new Promise((resolve, reject) => {
      this.queryContextSwitchEvents()
        .then((events) => {
          const frequency = events.length;
          const duration = events.reduce((acc, curr, index, arr) => {
            if (index === 0) return acc;
            return acc + (new Date(curr.timestamp) - new Date(arr[index - 1].timestamp));
          }, 0) / frequency;

          resolve({ frequency, duration });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = BehavioralEventsDAO;
