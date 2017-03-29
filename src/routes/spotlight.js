var path = require('path');
var requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
var express = require('express');
var router = express.Router();
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const Promise = require('bluebird');

var authentication = require(path.join(__dirname, '..', 'middleware', 'authentication'));

/**
 * POST /spotlight
 *
 * respond with spotlight items
 */

const uri = {
  spotlight: 'https://vtop.vit.ac.in/student/include_spotlight.asp'
};

router.post('/', authentication, (req, res, next) => {
  const tasks = [
    requests.get(uri.spotlight, req.cookies).then(home.parseSpotlight)
  ];
  Promise.all(tasks)
    .then(results => {
      res.json({spotlight: results[0]});
    }).catch(err => res.status(500).json({ message: err }));
});

module.exports = router;
