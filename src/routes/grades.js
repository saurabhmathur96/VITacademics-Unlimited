var express = require('express');
var router = express.Router();

/**
 * POST /grades
 *
 * respond with academic history
 */
router.get('/', (req, res, next) => {
  res.json({ message: 'Work in Progress!' });
});

module.exports = router;
