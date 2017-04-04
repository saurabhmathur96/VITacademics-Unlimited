const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const Promise = require('bluebird');
const express = require('express');
let router = express.Router();

/**
 * POST /spotlight
 *
 * respond with spotlight items
 */

const uri = {
  spotlight: 'https://vtop.vit.ac.in/student/include_spotlight.asp'
};

router.post('/', (req, res, next) => {
  const task = requests.get(uri.spotlight, req.cookies).then(home.parseSpotlight);
  task
    .then(result => res.json({ 'spotlight': result }))
    .catch(next);
});

module.exports = router;
