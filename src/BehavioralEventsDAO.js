const sqlite3 = require('sqlite3').verbose();

class BehavioralEventsDAO {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.createTable();
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS BehavioralEvents (
        eventId TEXT PRIMARY KEY,
        eventType TEXT,
        timestamp TEXT,
        metadata TEXT
      )
    `;
    this.db.run(sql);
  }

  addEvent(event) {
    const sql = `
      INSERT INTO BehavioralEvents (eventId, eventType, timestamp, metadata)
      VALUES (?, ?, ?, ?)
    `;
    const params = [event.eventId, event.eventType, event.timestamp, JSON.stringify(event.metadata)];
    this.db.run(sql, params, function (err) {
      if (err) {
        console.error('Error adding event:', err);
      }
    });
  }

  updateEvent(event) {
    const sql = `
      UPDATE BehavioralEvents
      SET eventType = ?, timestamp = ?, metadata = ?
      WHERE eventId = ?
    `;
    const params = [event.eventType, event.timestamp, JSON.stringify(event.metadata), event.eventId];
    this.db.run(sql, params, function (err) {
      if (err) {
        console.error('Error updating event:', err);
      }
    });
  }

  deleteEvent(eventId) {
    const sql = `
      DELETE FROM BehavioralEvents
      WHERE eventId = ?
    `;
    this.db.run(sql, eventId, function (err) {
      if (err) {
        console.error('Error deleting event:', err);
      }
    });
  }

  queryEvents(callback) {
    const sql = `
      SELECT * FROM BehavioralEvents
    `;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error querying events:', err);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
}

module.exports = BehavioralEventsDAO;
