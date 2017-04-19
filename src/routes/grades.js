const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const express = require('express');
const router = express.Router();

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
