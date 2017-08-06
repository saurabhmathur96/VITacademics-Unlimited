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


router.post('/', (req, res, next) => {
  const campus = req.body.campus;
  const baseUri = (campus === 'chennai' ? 'https://academicscc.vit.ac.in/student' : 'https://vtop.vit.ac.in/student');
  const uri = `${baseUri}/student_history.asp`;
  const task = requests.get(uri, req.cookies);
  task.then(academic.parseHistory)
    .then(result => res.json(result))
    .catch(next);
});

module.exports = router;
