var path = require('path');
var requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
var express = require('express');
var router = express.Router();

/**
 * POST /spotlight
 *
 * respond with spotlight items
 */
router.post('/', (req, res, next) => {
  res.json({ message: 'Work in Progress!' });
});

module.exports = router;
