const FocusRecordsDAO = require('../dao/FocusRecordsDAO');

class FocusRecordsCleanup {
  constructor() {
    this.db = FocusRecordsDAO.db;
  }

  async cleanupOldRecords(retentionPeriodDays) {
    const retentionPeriodMs = retentionPeriodDays * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionPeriodMs).toISOString();

    const sql = `
      DELETE FROM FocusRecords
      WHERE timestamp < ?
    `;
    try {
      await this.db.run(sql, [cutoffDate]);
      console.log(`Old records older than ${retentionPeriodDays} days have been cleaned up.`);
    } catch (err) {
      console.error('Error cleaning up old records:', err);
    }
  }
}

module.exports = FocusRecordsCleanup;
