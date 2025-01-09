const db = require('../db/connection');
const BehavioralEventsDAO = require('../dao/BehavioralEventsDAO');

class BehavioralEventsDAO {
  constructor() {
    this.db = db;
  }
}

module.exports = BehavioralEventsDAO;
