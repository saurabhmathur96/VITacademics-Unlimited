var path = require('path');
var requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
var attendance = require(path.join(__dirname, '..', 'utilities', 'attendance'));
var schedule = require(path.join(__dirname, '..', 'utilities', 'schedule'));
var express = require('express');
var router = express.Router();

var login = require('../middleware/authentication');

/**
 * POST /refresh
 *
 * respond with (daily, exam) schedule, attendance and marks details
 */
router.post('/', login, (req, res, next) => {
  res.json({ message: 'Work in Progress!' });

}

module.exports = router;
