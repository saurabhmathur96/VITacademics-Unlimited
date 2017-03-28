var path = require('path');
var requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
var academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
var express = require('express');
var router = express.Router();

/**
 * POST /grades
 *
 * respond with academic history
 */

const uri = 'https://vtop.vit.ac.in/student/student_history.asp';
router.post('/', (req, res, next) => {
  let task = requests.get(uri, req.cookies);
  task.then(academic.parseHistory)
  .then(result => res.json(result))
  .catch(next);
});

module.exports = router;
