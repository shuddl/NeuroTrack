const db = require('../db/connection');

class TimerRecordsDAO {
  static createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS timer_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE,
        goal_focus_time INTEGER,
        non_goal_focus_time INTEGER
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

  static insertRecord(date, goalFocusTime, nonGoalFocusTime) {
    const sql = `
      INSERT INTO timer_records (date, goal_focus_time, non_goal_focus_time)
      VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, [date, goalFocusTime, nonGoalFocusTime], function (err) {
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
      SELECT * FROM timer_records
      ORDER BY date DESC
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

module.exports = TimerRecordsDAO;
