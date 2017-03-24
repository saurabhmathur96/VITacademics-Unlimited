var express = require('express');
var router = express.Router();

/**
 * POST /spotlight
 *
 * respond with spotlight items
 */
router.get('/', (req, res, next) => {
  res.json({ message: 'Work in Progress!' });
});

module.exports = router;
