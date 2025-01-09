const db = require('../db/connection');
const FocusRecordsDAO = require('../dao/FocusRecordsDAO');

class FocusRecordsDAO {
  constructor() {
    this.db = db;
  }
}

module.exports = FocusRecordsDAO;
