const sqlite3 = require('sqlite3').verbose();

class FocusRecordsCleanup {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
  }

  cleanupOldRecords(retentionPeriodDays) {
    const retentionPeriodMs = retentionPeriodDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionPeriodMs).toISOString();

    const sql = `
      DELETE FROM FocusRecords
      WHERE timestamp < ?
    `;
    this.db.run(sql, [cutoffDate], function (err) {
      if (err) {
        console.error('Error cleaning up old records:', err);
      } else {
        console.log(`Old records older than ${retentionPeriodDays} days have been cleaned up.`);
      }
    });
  }
}

module.exports = FocusRecordsCleanup;
