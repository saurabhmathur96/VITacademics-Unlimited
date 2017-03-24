var express = require('express');
var router = express.Router();

/**
 * POST /refresh
 *
 * respond with time-table and attendance details
 */
router.get('/', (req, res, next) => {
  res.json({ message: 'Work in Progress!' });
});

module.exports = router;
