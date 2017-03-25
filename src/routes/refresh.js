var express = require('express');
var router = express.Router();

var login = require('../middleware/authentication');
/**
 * POST /refresh
 *
 * respond with time-table and attendance details
 */
router.post('/', login, (req, res, next) => {
  res.json({ message: 'Work in Progress!' });
});

module.exports = router;
