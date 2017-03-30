const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const express = require('express');
let router = express.Router();

/**
 * GET faculty/find/<faculty-id>
 */
router.get('/find', (req, res, next) => {
  //
})

/**
 * GET faculty/search?name=<name>&school=<school-name>
 */
router.get('/search', (req, res, next) => {
  //
})


module.exports = router;
